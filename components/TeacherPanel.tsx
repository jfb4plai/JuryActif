'use client'
import { useState } from 'react'
import type { QuestionType } from '@/lib/supabase/types'

const TYPE_LABELS: Record<QuestionType, string> = {
  paternite: 'Paternité',
  comprehension: 'Compréhension',
  maitrise: 'Maîtrise',
  piege: 'Piège',
  perso: 'Perso',
}

interface Props {
  nextType: QuestionType
  onInject: (question: string) => void
  onSkip: () => void
  onAnnotate: (note: string) => void
}

export default function TeacherPanel({ nextType, onInject, onSkip, onAnnotate }: Props) {
  const [open, setOpen] = useState(false)
  const [custom, setCustom] = useState('')
  const [note, setNote] = useState('')

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-10 flex">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="bg-plai-orange text-white text-xs font-bold px-2 py-3 rounded-l [writing-mode:vertical-rl]"
        aria-label={open ? 'Fermer le panneau enseignant' : 'Ouvrir le panneau enseignant'}
      >
        {open ? '→' : '← Enseignant'}
      </button>
      {open && (
        <div className="w-64 bg-white border border-jfb-bordure rounded-r-lg shadow-lg p-4 space-y-4">
          <div className="text-xs font-bold text-gray-400 uppercase">Panneau enseignant</div>
          <div className="text-xs text-gray-500">
            Prochain type prévu : <strong>{TYPE_LABELS[nextType]}</strong>
          </div>

          <div>
            <div className="text-xs font-semibold text-jfb-noir mb-1">Injecter une question</div>
            <textarea
              value={custom}
              onChange={e => setCustom(e.target.value)}
              placeholder="Ta question personnalisée…"
              className="w-full border border-jfb-bordure rounded p-2 text-xs h-16 resize-none focus:outline-none focus:border-jfb-noir"
              aria-label="Question à injecter"
            />
            <button
              type="button"
              onClick={() => { onInject(custom); setCustom('') }}
              disabled={!custom.trim()}
              className="mt-1 w-full bg-plai-orange text-white text-xs py-1.5 rounded disabled:opacity-40"
            >
              Injecter
            </button>
          </div>

          <button
            type="button"
            onClick={onSkip}
            className="w-full border border-jfb-bordure text-gray-500 text-xs py-1.5 rounded hover:border-jfb-noir"
          >
            Passer cette question
          </button>

          <div>
            <div className="text-xs font-semibold text-jfb-noir mb-1">Annoter la réponse suivante</div>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Note pour le rapport…"
              className="w-full border border-jfb-bordure rounded p-2 text-xs h-12 resize-none focus:outline-none"
              aria-label="Annotation à ajouter au rapport"
            />
            <button
              type="button"
              onClick={() => { onAnnotate(note); setNote('') }}
              disabled={!note.trim()}
              className="mt-1 w-full border border-jfb-bordure text-gray-500 text-xs py-1.5 rounded disabled:opacity-40"
            >
              Annoter
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
