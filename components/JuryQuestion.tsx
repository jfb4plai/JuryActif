import type { QuestionType } from '@/lib/supabase/types'

const TYPE_COLORS: Record<QuestionType, string> = {
  paternite:    'bg-red-100 text-red-700',
  comprehension:'bg-amber-100 text-amber-700',
  maitrise:     'bg-emerald-100 text-emerald-700',
  piege:        'bg-purple-100 text-purple-700',
  perso:        'bg-jfb-beige text-jfb-gris',
}

const TYPE_LABELS: Record<QuestionType, string> = {
  paternite:    'Paternité',
  comprehension:'Compréhension',
  maitrise:     'Maîtrise',
  piege:        'Question piège',
  perso:        'Question personnalisée',
}

interface Props {
  question: string
  type: QuestionType
}

export default function JuryQuestion({ question, type }: Props) {
  return (
    <div className="bg-jfb-beige border-l-4 border-jfb-noir px-6 py-5 border border-jfb-bordure border-t-0">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-bold text-jfb-gris-cl uppercase tracking-widest">Le Jury</span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${TYPE_COLORS[type]}`}>
          {TYPE_LABELS[type]}
        </span>
      </div>
      <p className="text-jfb-noir text-base leading-relaxed">{question}</p>
    </div>
  )
}
