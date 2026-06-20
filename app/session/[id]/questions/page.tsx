'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { nextQuestionType } from '@/lib/jury-strategy'
import type { JurySession, QuestionType } from '@/lib/supabase/types'

const TYPE_LABELS: Record<QuestionType, string> = {
  paternite: 'Paternité',
  comprehension: 'Compréhension',
  maitrise: 'Maîtrise',
  piege: 'Piège',
  perso: 'Perso',
}

interface GeneratedQuestion { question: string; type: QuestionType }

export default function ModeCQuestionsPage() {
  const { id } = useParams<{ id: string }>()
  const supabase = createClient()
  const [session, setSession] = useState<JurySession | null>(null)
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([])
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState(false)

  useEffect(() => {
    if (!id) return
    async function load() {
      const { data } = await supabase
        .from('jury_sessions')
        .select('*')
        .eq('id', id)
        .single() as { data: JurySession | null }
      setSession(data)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const generate = async () => {
    if (!session) return
    setLoading(true)
    const total = 12
    const result: GeneratedQuestion[] = []
    const types: QuestionType[] = []

    for (let i = 0; i < total; i++) {
      const qType = nextQuestionType(types, total, session.intensite)
      const res = await fetch('/api/jury/next-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionType: qType,
          tfeResume: session.tfe_resume,
          history: result.map(q => ({
            question: q.question,
            question_type: q.type,
            reponse: '',
            hesitation_sec: 0,
            timestamp: '',
          })),
          customQuestions: [],
          intensite: session.intensite,
        }),
      })
      if (res.ok) {
        const data = await res.json() as { question: string; type: QuestionType }
        result.push({ question: data.question, type: qType })
        types.push(qType)
      }
    }

    setQuestions(result)
    setGenerated(true)
    setLoading(false)
  }

  const copyAll = () => {
    const text = questions.map((q, i) => `${i + 1}. [${TYPE_LABELS[q.type]}] ${q.question}`).join('\n')
    navigator.clipboard.writeText(text)
  }

  if (!session) {
    return <div className="p-10 text-sm text-gray-500 text-center">Chargement…</div>
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-jfb-noir mb-2">Banque de questions jury</h1>
      <p className="text-sm text-gray-500 mb-6">{session.titre_tfe} — {session.filiere}</p>

      {!generated && (
        <button
          type="button"
          onClick={generate}
          disabled={loading}
          className="bg-jfb-noir text-white px-6 py-3 rounded font-semibold text-sm disabled:opacity-50"
        >
          {loading ? 'Génération en cours…' : 'Générer 12 questions stratégiques'}
        </button>
      )}

      {loading && (
        <div className="mt-4 text-sm text-gray-500">Génération en cours — {questions.length}/12 questions…</div>
      )}

      {generated && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">{questions.length} questions générées</span>
            <button
              type="button"
              onClick={copyAll}
              className="text-xs border border-jfb-bordure px-3 py-1.5 rounded text-gray-500 hover:border-jfb-noir"
            >
              Tout copier
            </button>
          </div>
          {questions.map((q, i) => (
            <div key={i} className="bg-white border border-jfb-bordure rounded px-4 py-3">
              <span className="text-xs text-gray-400 mr-2">{i + 1}. [{TYPE_LABELS[q.type]}]</span>
              <p className="text-sm text-jfb-noir mt-1">{q.question}</p>
            </div>
          ))}
          <button
            type="button"
            onClick={generate}
            className="text-xs text-gray-400 underline"
          >
            Regénérer
          </button>
        </div>
      )}
    </main>
  )
}
