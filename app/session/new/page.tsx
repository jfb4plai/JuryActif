'use client'
import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import TfeUploader from '@/components/TfeUploader'
import SessionConfig from '@/components/SessionConfig'
import { createClient } from '@/lib/supabase/client'
import type { TfeResume } from '@/lib/supabase/types'

function NewSessionInner() {
  const searchParams = useSearchParams()
  const mode = (searchParams.get('mode') ?? 'A') as 'A' | 'B' | 'C'
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<1 | 2>(1)
  const [titre, setTitre] = useState('')
  const [filiere, setFiliere] = useState('')
  const [niveau, setNiveau] = useState('')
  const [tfeTexte, setTfeTexte] = useState('')
  const [tfeResume, setTfeResume] = useState<TfeResume | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [truncated, setTruncated] = useState(false)

  const handleExtracted = (text: string, filename: string, isTruncated: boolean) => {
    setTfeTexte(text)
    setTruncated(isTruncated)
    if (!titre) setTitre(filename)
  }

  const handleAnalyze = async () => {
    if (!titre || !filiere || !tfeTexte) {
      setError('Titre, filière et texte du TFE sont requis.')
      return
    }
    setAnalyzing(true)
    setError(null)
    try {
      const res = await fetch('/api/jury/analyze-tfe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titre, filiere, texte: tfeTexte }),
      })
      if (!res.ok) {
        const { error: msg } = await res.json().catch(() => ({ error: 'Erreur serveur' }))
        setError(msg ?? 'Erreur lors de l\'analyse du TFE.')
        return
      }
      setTfeResume(await res.json())
      setStep(2)
    } catch {
      setError('Erreur réseau — vérifiez votre connexion.')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleConfig = async (config: {
    duree_cible_min: number
    intensite: 'standard' | 'approfondi'
    label_eleve: string
    selected_question_ids: string[]
  }) => {
    setError(null)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) { router.push('/auth/login'); return }

    const { data, error: dbError } = await supabase.from('jury_sessions').insert({
      user_id: user.id,
      mode,
      titre_tfe: titre,
      filiere,
      niveau: niveau || null,
      tfe_texte: tfeTexte,
      tfe_resume: tfeResume,
      duree_cible_min: config.duree_cible_min,
      intensite: config.intensite,
      label_eleve: config.label_eleve || null,
      selected_question_ids: config.selected_question_ids,
      started_at: new Date().toISOString(),
    }).select().single()

    if (dbError || !data) {
      if (dbError) console.error('[jury_sessions insert]', dbError.code, dbError.message)
      setError('Erreur lors de la création de la session.')
      return
    }

    router.push(mode === 'C' ? `/session/${data.id}/questions` : `/session/${data.id}`)
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-6">
        <span className="text-xs font-bold text-jfb-gris-cl uppercase tracking-widest">
          Mode {mode} — {step === 1 ? 'Étape 1 : Ton TFE' : 'Étape 2 : Config du jury'}
        </span>
        <h1 className="text-2xl font-bold text-jfb-noir mt-1">
          {step === 1 ? 'Upload de ton TFE' : 'Configurer la session'}
        </h1>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-jfb-noir mb-1">Titre du TFE *</label>
              <input
                value={titre}
                onChange={e => setTitre(e.target.value)}
                placeholder="ex. Les énergies renouvelables…"
                className="w-full border border-jfb-bordure rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-jfb-noir mb-1">Filière *</label>
              <input
                value={filiere}
                onChange={e => setFiliere(e.target.value)}
                placeholder="ex. Sciences, Humanités…"
                className="w-full border border-jfb-bordure rounded px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-jfb-noir mb-1">Niveau (optionnel)</label>
            <input
              value={niveau}
              onChange={e => setNiveau(e.target.value)}
              placeholder="ex. 6e générale"
              className="w-full border border-jfb-bordure rounded px-3 py-2 text-sm"
            />
          </div>
          <TfeUploader onExtracted={handleExtracted} />
          {tfeTexte && (
            <p className="text-xs text-plai-teal font-semibold">
              ✓ Texte extrait — {tfeTexte.length.toLocaleString()} caractères
            </p>
          )}
          {truncated && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
              Le TFE dépasse 40 000 caractères — seules les premières parties ont été transmises au jury.
              Les questions porteront sur ce qui a été lu, pas nécessairement sur la conclusion ou les annexes.
            </p>
          )}
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={analyzing || !tfeTexte}
            className="w-full bg-jfb-noir text-white py-3 rounded font-semibold text-sm disabled:opacity-50"
          >
            {analyzing ? 'Analyse du TFE en cours…' : 'Analyser le TFE →'}
          </button>
        </div>
      )}

      {step === 2 && tfeResume && (
        <div className="space-y-6">
          <div className="bg-jfb-beige rounded-lg p-4 text-sm text-jfb-gris">
            <p className="font-semibold text-jfb-noir mb-1">Résumé détecté par le jury</p>
            <p>{tfeResume.resume}</p>
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <SessionConfig mode={mode} onConfig={handleConfig} />
        </div>
      )}
    </main>
  )
}

export default function NewSessionPage() {
  return <Suspense><NewSessionInner /></Suspense>
}
