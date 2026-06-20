'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { nextQuestionType } from '@/lib/jury-strategy'
import JuryQuestion from '@/components/JuryQuestion'
import StudentResponse from '@/components/StudentResponse'
import SessionTimer from '@/components/SessionTimer'
import TeacherPanel from '@/components/TeacherPanel'
import type { JurySession, JuryQuestion as JuryQuestionRow, Exchange, QuestionType } from '@/lib/supabase/types'

export default function SessionPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [session, setSession] = useState<JurySession | null>(null)
  const [customQuestions, setCustomQuestions] = useState<JuryQuestionRow[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<{ question: string; type: QuestionType } | null>(null)
  const [history, setHistory] = useState<Exchange[]>([])
  const [loading, setLoading] = useState(true)
  const [waitingForQuestion, setWaitingForQuestion] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [startedAt] = useState(() => new Date())
  const [pendingAnnotation, setPendingAnnotation] = useState<string | null>(null)

  useEffect(() => {
    async function loadSession() {
      const { data: sess, error: sessError } = await supabase
        .from('jury_sessions')
        .select('*')
        .eq('id', id)
        .single()

      if (sessError || !sess) {
        setError('Session introuvable.')
        setLoading(false)
        return
      }

      setSession(sess)

      // Load only the custom questions selected for this session
      if (sess.selected_question_ids.length > 0) {
        const { data: qs } = await supabase
          .from('jury_questions')
          .select('*')
          .in('id', sess.selected_question_ids)
        setCustomQuestions(qs ?? [])
      }

      setLoading(false)
    }
    loadSession()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const fetchNextQuestion = useCallback(async (currentHistory: Exchange[], sess: JurySession, qs: JuryQuestionRow[]) => {
    setWaitingForQuestion(true)
    setError(null)

    // ~0.5 questions per minute — 25 min → ~12 questions
    const totalExpected = Math.max(4, Math.round(sess.duree_cible_min * 0.5))
    const qType = nextQuestionType(
      currentHistory.map(e => e.question_type),
      totalExpected,
      sess.intensite
    )

    try {
      const res = await fetch('/api/jury/next-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: id,
          questionType: qType,
          tfeResume: sess.tfe_resume,
          history: currentHistory,
          customQuestions: qs.map(q => ({ intitule: q.intitule, type: q.type })),
          intensite: sess.intensite,
        }),
      })
      if (!res.ok) throw new Error('API error')
      const data = await res.json() as { question: string; type: QuestionType }
      setCurrentQuestion({ question: data.question, type: data.type })
    } catch {
      setError('Erreur réseau — le jury ne répond pas. Réessayez.')
    } finally {
      setWaitingForQuestion(false)
    }
  }, [id])

  // Fetch first question once session is loaded
  useEffect(() => {
    if (!loading && session) {
      fetchNextQuestion([], session, customQuestions)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading])

  const handleResponse = async (reponse: string, hesitationSec: number) => {
    if (!currentQuestion || !session) return
    const exchange: Exchange = {
      question: currentQuestion.question,
      question_type: currentQuestion.type,
      reponse,
      hesitation_sec: hesitationSec,
      annotation: pendingAnnotation ?? undefined,
      timestamp: new Date().toISOString(),
    }
    setPendingAnnotation(null)
    const newHistory = [...history, exchange]
    setHistory(newHistory)
    setCurrentQuestion(null)
    await fetchNextQuestion(newHistory, session, customQuestions)
  }

  const handleEnd = useCallback(async () => {
    await supabase
      .from('jury_sessions')
      .update({ ended_at: new Date().toISOString() })
      .eq('id', id)
    // Use sessionStorage to pass history (avoids URL length limits for long sessions)
    try {
      sessionStorage.setItem(`jury_history_${id}`, JSON.stringify(history))
    } catch { /* storage unavailable — report page will handle missing history */ }
    router.push(`/session/${id}/report`)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, history])

  if (loading) {
    return <div className="p-10 text-center text-jfb-gris text-sm">Chargement de la session…</div>
  }
  if (error && !session) {
    return <div className="p-10 text-center text-red-600 text-sm">{error}</div>
  }
  if (!session) {
    return <div className="p-10 text-center text-red-600 text-sm">Session introuvable.</div>
  }

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="bg-jfb-noir text-white px-5 py-3 rounded-t-lg flex justify-between items-center">
        <span className="text-sm font-semibold truncate max-w-xs">{session.titre_tfe}</span>
        <button
          type="button"
          onClick={handleEnd}
          className="text-xs text-jfb-gris-cl border border-jfb-gris-cl px-3 py-1 rounded hover:text-white hover:border-white transition-colors"
        >
          Terminer
        </button>
      </div>

      {/* Timer */}
      <SessionTimer
        startedAt={startedAt}
        dureeCibleMin={session.duree_cible_min}
        onTimeUp={handleEnd}
      />

      {/* History */}
      {history.length > 0 && (
        <div className="bg-jfb-subtil border border-jfb-bordure border-t-0 px-5 py-3 max-h-24 overflow-y-auto">
          <div className="text-xs text-jfb-gris-cl mb-1 uppercase tracking-widest">Échanges précédents</div>
          <div className="text-xs text-jfb-gris leading-relaxed">
            {history.slice(-3).map((e, i) => (
              <span key={i}>
                <span className="text-plai-teal font-semibold">J:</span>{' '}
                {e.question.length > 60 ? e.question.slice(0, 60) + '…' : e.question} —{' '}
                <span className="font-semibold">É:</span>{' '}
                {e.reponse.length > 60 ? e.reponse.slice(0, 60) + '…' : e.reponse}{' '}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Current question */}
      {waitingForQuestion && (
        <div className="bg-jfb-beige border-l-4 border-jfb-bordure px-6 py-5 border border-jfb-bordure border-t-0">
          <p className="text-jfb-gris text-sm italic">Le jury réfléchit…</p>
        </div>
      )}
      {currentQuestion && !waitingForQuestion && (
        <JuryQuestion question={currentQuestion.question} type={currentQuestion.type} />
      )}
      {error && !waitingForQuestion && (
        <p className="text-red-600 text-sm px-6 py-2 border border-jfb-bordure border-t-0">{error}</p>
      )}

      {/* Response */}
      <StudentResponse
        onSend={handleResponse}
        disabled={waitingForQuestion || !currentQuestion}
      />

      {/* Teacher panel for mode B — hidden while waiting to prevent double-skip */}
      {session.mode === 'B' && currentQuestion && !waitingForQuestion && (
        <TeacherPanel
          nextType={currentQuestion.type}
          onInject={q => setCurrentQuestion({ question: q, type: 'perso' })}
          onSkip={() => { setCurrentQuestion(null); if (session) fetchNextQuestion(history, session, customQuestions) }}
          onAnnotate={note => setPendingAnnotation(note)}
        />
      )}

      {/* End session */}
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={handleEnd}
          className="text-xs text-jfb-gris-cl underline hover:text-jfb-noir"
        >
          Terminer la session maintenant
        </button>
      </div>
    </div>
  )
}
