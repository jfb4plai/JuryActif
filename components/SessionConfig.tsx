'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { JuryQuestion, Intensite } from '@/lib/supabase/types'

interface Props {
  mode: 'A' | 'B' | 'C'
  onConfig: (config: {
    duree_cible_min: number
    intensite: Intensite
    label_eleve: string
    selected_question_ids: string[]
  }) => void
}

export default function SessionConfig({ mode, onConfig }: Props) {
  const [duree, setDuree] = useState(25)
  const [intensite, setIntensite] = useState<Intensite>('standard')
  const [labelEleve, setLabelEleve] = useState('')
  const [questions, setQuestions] = useState<JuryQuestion[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const supabase = createClient()

  useEffect(() => {
    supabase.from('jury_questions').select('*').order('created_at', { ascending: false })
      .then(({ data }) => setQuestions(data ?? []))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleQ = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleSubmit = () => {
    onConfig({
      duree_cible_min: duree,
      intensite,
      label_eleve: labelEleve,
      selected_question_ids: Array.from(selected),
    })
  }

  return (
    <div className="space-y-6">
      {(mode === 'A' || mode === 'B') && (
        <div>
          <label className="block text-sm font-semibold text-jfb-noir mb-1">
            {mode === 'A' ? 'Ton identifiant pour ce rapport' : 'Identifiant de l\'élève'}
          </label>
          <input
            value={labelEleve}
            onChange={e => setLabelEleve(e.target.value)}
            placeholder="ex. Marie, 3A-07, ELV-042"
            className="w-full border border-jfb-bordure rounded px-3 py-2 text-sm"
          />
          <p className="text-xs text-jfb-gris-cl mt-1">Prénom, code ou numéro — pas de nom complet.</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-jfb-noir mb-2">Durée cible</label>
        <div className="flex gap-3">
          {[15, 25, 40].map(d => (
            <button
              key={d}
              type="button"
              onClick={() => setDuree(d)}
              className={`px-4 py-2 rounded border text-sm font-medium ${duree === d ? 'bg-jfb-noir text-white border-jfb-noir' : 'border-jfb-bordure text-jfb-gris'}`}
            >
              {d} min
            </button>
          ))}
        </div>
        <p className="text-xs text-jfb-gris-cl mt-1">Le jury adapte le nombre de questions à la durée choisie.</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-jfb-noir mb-2">Intensité du jury</label>
        <div className="flex gap-3">
          {(['standard', 'approfondi'] as Intensite[]).map(i => (
            <button
              key={i}
              type="button"
              onClick={() => setIntensite(i)}
              className={`px-4 py-2 rounded border text-sm font-medium capitalize ${intensite === i ? 'bg-jfb-noir text-white border-jfb-noir' : 'border-jfb-bordure text-jfb-gris'}`}
            >
              {i}
            </button>
          ))}
        </div>
        <p className="text-xs text-jfb-gris-cl mt-1">Approfondi : plus de questions pièges et de relances.</p>
      </div>

      {questions.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-jfb-noir mb-2">
            Questions personnalisées — tes 20% (optionnel)
          </label>
          <p className="text-xs text-jfb-gris-cl mb-2">Sélectionne les questions que le jury devra poser à cet élève en particulier.</p>
          <div className="space-y-2 max-h-40 overflow-y-auto border border-jfb-bordure rounded p-2">
            {questions.map(q => (
              <label key={q.id} className="flex items-start gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={selected.has(q.id)}
                  onChange={() => toggleQ(q.id)}
                  className="mt-0.5"
                />
                <span className="text-jfb-gris-cl text-xs uppercase mr-1">[{q.type}]</span>
                {q.intitule}
              </label>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        className="w-full bg-jfb-noir text-white py-3 rounded font-semibold text-sm"
      >
        Lancer la session →
      </button>
    </div>
  )
}
