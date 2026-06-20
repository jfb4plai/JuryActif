'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import SessionReport from '@/components/SessionReport'
import ReportExport from '@/components/ReportExport'
import type { JurySession, Exchange, ReportJson } from '@/lib/supabase/types'

type PageState = 'generating' | 'editing' | 'saving' | 'saved' | 'error'

export default function ReportPage() {
  const { id } = useParams<{ id: string }>()
  const supabase = createClient()

  const [state, setState] = useState<PageState>('generating')
  const [report, setReport] = useState<ReportJson | null>(null)
  const [editedGlobales, setEditedGlobales] = useState('')
  const [shareToken, setShareToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function generate() {
      // Check if report already exists (idempotency)
      const { data: existing } = await supabase
        .from('jury_reports')
        .select('*')
        .eq('session_id', id)
        .single()

      if (existing) {
        setReport(existing.rapport_json as ReportJson)
        setEditedGlobales((existing.rapport_json as ReportJson).observations_globales)
        setShareToken(existing.share_token as string)
        setState('saved')
        return
      }

      // Load session metadata
      const { data: sess } = await supabase
        .from('jury_sessions')
        .select('*')
        .eq('id', id)
        .single() as { data: JurySession | null }

      if (!sess) { setError('Session introuvable.'); setState('error'); return }

      // Read history from sessionStorage (written by session page on handleEnd)
      let storedHistory: Exchange[] = []
      try {
        storedHistory = JSON.parse(sessionStorage.getItem(`jury_history_${id}`) ?? '[]') as Exchange[]
      } catch { /* empty history — generate anyway */ }

      const dureeReelleMin = sess.ended_at && sess.started_at
        ? Math.round((new Date(sess.ended_at).getTime() - new Date(sess.started_at).getTime()) / 60000)
        : 0

      const res = await fetch('/api/jury/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: id,
          titreTfe: sess.titre_tfe,
          history: storedHistory,
          labelEleve: sess.label_eleve,
          dureeReelleMin,
        }),
      })

      if (!res.ok) {
        setError('Erreur lors de la génération du rapport — réessayez.')
        setState('error')
        return
      }

      const reportJson: ReportJson = await res.json()
      setReport(reportJson)
      setEditedGlobales(reportJson.observations_globales)
      setState('editing')
    }

    generate()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleSave = async () => {
    if (!report) return
    setState('saving')

    const finalReport: ReportJson = { ...report, observations_globales: editedGlobales }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setState('error'); setError('Session expirée — reconnectez-vous.'); return }

    const { data: saved, error: dbError } = await supabase
      .from('jury_reports')
      .insert({
        session_id: id,
        user_id: user.id,
        rapport_json: finalReport,
        label_eleve: finalReport.label_eleve || null,
      })
      .select()
      .single()

    if (dbError || !saved) {
      setState('error')
      setError("Erreur lors de l'enregistrement du rapport.")
      return
    }

    setReport(finalReport)
    setShareToken(saved.share_token as string)
    // Clean up sessionStorage after successful save
    try { sessionStorage.removeItem(`jury_history_${id}`) } catch { /* ignore */ }
    setState('saved')
  }

  const shareUrl = shareToken && typeof window !== 'undefined'
    ? `${window.location.origin}/r/${shareToken}`
    : null

  if (state === 'generating') {
    return <div className="p-10 text-center text-gray-500 text-sm">Génération du rapport par le jury IA…</div>
  }
  if (state === 'error') {
    return <div className="p-10 text-center text-red-600 text-sm">{error}</div>
  }
  if (!report) return null

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      {/* Actions header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-jfb-noir">Rapport de défense</h1>
          {state === 'editing' && (
            <p className="text-xs text-amber-600 mt-0.5">
              Relisez et ajustez les observations avant d&apos;enregistrer.
            </p>
          )}
        </div>
        <div className="flex gap-3 items-center">
          {state === 'saved' && shareUrl && (
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(shareUrl)}
              className="text-xs border border-jfb-bordure px-3 py-2 rounded text-gray-600 hover:border-gray-500"
            >
              Copier lien accompagnant
            </button>
          )}
          {state === 'saved' && <ReportExport report={report} />}
          {state === 'editing' && (
            <button
              type="button"
              onClick={handleSave}
              className="bg-jfb-noir text-white px-5 py-2 rounded font-semibold text-sm"
            >
              Enregistrer et partager →
            </button>
          )}
          {state === 'saving' && (
            <span className="text-sm text-gray-500">Enregistrement…</span>
          )}
        </div>
      </div>

      {state === 'saved' && shareUrl && (
        <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded p-3 text-sm text-emerald-800">
          Rapport enregistré. Lien accompagnant : <span className="font-mono text-xs">{shareUrl}</span>
        </div>
      )}

      <SessionReport
        report={report}
        editableGlobales={state === 'editing' ? editedGlobales : undefined}
        onEditGlobales={state === 'editing' ? setEditedGlobales : undefined}
      />
    </main>
  )
}
