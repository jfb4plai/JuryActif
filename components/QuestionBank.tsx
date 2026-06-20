'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { JuryQuestion, QuestionType } from '@/lib/supabase/types'

const TYPES: { value: QuestionType; label: string }[] = [
  { value: 'paternite', label: 'Paternité' },
  { value: 'comprehension', label: 'Compréhension' },
  { value: 'maitrise', label: 'Maîtrise' },
  { value: 'piege', label: 'Piège' },
  { value: 'perso', label: 'Perso libre' },
]

interface Props { initial: JuryQuestion[] }

export default function QuestionBank({ initial }: Props) {
  const [questions, setQuestions] = useState(initial)
  const [intitule, setIntitule] = useState('')
  const [type, setType] = useState<QuestionType>('perso')
  const [ecole, setEcole] = useState('')
  const [matiere, setMatiere] = useState('')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const handleAdd = async () => {
    if (!intitule.trim()) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const { data } = await supabase.from('jury_questions').insert({
      user_id: user.id,
      intitule: intitule.trim(),
      type,
      ecole: ecole || null,
      matiere: matiere || null,
    }).select().single()
    if (data) setQuestions(prev => [data, ...prev])
    setIntitule('')
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    await supabase.from('jury_questions').delete().eq('id', id)
    setQuestions(prev => prev.filter(q => q.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-jfb-bordure rounded-lg p-5 space-y-3">
        <h2 className="font-semibold text-jfb-noir text-sm">Ajouter une question</h2>
        <textarea
          value={intitule}
          onChange={e => setIntitule(e.target.value)}
          placeholder="ex. Pourquoi avoir choisi cette méthodologie plutôt qu'une autre ?"
          className="w-full border border-jfb-bordure rounded px-3 py-2 text-sm h-20 resize-none focus:outline-none focus:border-jfb-noir"
          aria-label="Intitulé de la question personnalisée"
        />
        <div className="grid grid-cols-3 gap-3">
          <select
            value={type}
            onChange={e => setType(e.target.value as QuestionType)}
            className="border border-jfb-bordure rounded px-2 py-1.5 text-sm"
            aria-label="Type de question"
          >
            {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <input
            value={ecole}
            onChange={e => setEcole(e.target.value)}
            placeholder="École (optionnel)"
            className="border border-jfb-bordure rounded px-2 py-1.5 text-sm"
          />
          <input
            value={matiere}
            onChange={e => setMatiere(e.target.value)}
            placeholder="Matière (optionnel)"
            className="border border-jfb-bordure rounded px-2 py-1.5 text-sm"
          />
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={saving || !intitule.trim()}
          className="bg-jfb-noir text-white px-4 py-2 rounded text-sm font-semibold disabled:opacity-40"
        >
          Ajouter
        </button>
      </div>

      <div className="space-y-2">
        {questions.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-6">Aucune question personnalisée — ajoutez-en ci-dessus.</p>
        )}
        {questions.map(q => (
          <div key={q.id} className="bg-white border border-jfb-bordure rounded px-4 py-3 flex justify-between items-start gap-3">
            <div>
              <span className="text-xs text-gray-400 uppercase mr-2">[{q.type}]</span>
              {q.ecole && <span className="text-xs text-gray-400 mr-2">{q.ecole}</span>}
              {q.matiere && <span className="text-xs text-gray-400 mr-2">{q.matiere}</span>}
              <p className="text-sm text-jfb-noir mt-1">{q.intitule}</p>
            </div>
            <button
              type="button"
              onClick={() => handleDelete(q.id)}
              className="text-gray-400 hover:text-red-500 text-xs shrink-0"
              aria-label={`Supprimer la question : ${q.intitule.slice(0, 40)}`}
            >
              Suppr.
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
