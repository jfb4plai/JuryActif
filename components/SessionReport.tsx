import type { ReportJson, DimensionResult } from '@/lib/supabase/types'

const SIGNAL_ICON: Record<DimensionResult['signal'], string> = {
  alerte: '⚠',
  partiel: '~',
  ok: '✓',
}
const SIGNAL_CHIP: Record<DimensionResult['signal'], string> = {
  alerte: 'text-red-600 bg-red-50 border-red-300',
  partiel: 'text-amber-600 bg-amber-50 border-amber-300',
  ok: 'text-emerald-600 bg-emerald-50 border-emerald-300',
}
const SIGNAL_BANNER: Record<DimensionResult['signal'], string> = {
  alerte: 'border-l-4 border-red-500 bg-red-50',
  partiel: 'border-l-4 border-amber-400 bg-amber-50',
  ok: 'border-l-4 border-emerald-400 bg-emerald-50',
}
const DIM_LABELS = {
  paternite: 'Paternité',
  comprehension: 'Compréhension',
  maitrise: 'Maîtrise du sujet',
  pieges: 'Questions pièges',
} as const

type Dim = keyof typeof DIM_LABELS

interface Props {
  report: ReportJson
  editableGlobales?: string
  onEditGlobales?: (v: string) => void
}

export default function SessionReport({ report, editableGlobales, onEditGlobales }: Props) {
  const dims: Dim[] = ['paternite', 'comprehension', 'maitrise', 'pieges']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-jfb-noir text-white rounded-t-lg p-5">
        <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Rapport de défense — JuryActif</div>
        <div className="text-lg font-bold">{report.titre_tfe}</div>
        <div className="text-xs text-gray-400 mt-1">
          {report.label_eleve && <span>{report.label_eleve} · </span>}
          {new Date(report.date).toLocaleDateString('fr-BE')} · {report.duree_reelle_min} min · {report.nb_questions} questions
        </div>
      </div>

      {/* 4 dimension chips */}
      <div className="grid grid-cols-2 gap-3">
        {dims.map(dim => {
          const d = report[dim]
          if (!d) return null
          return (
            <div key={dim} className={`rounded-lg p-4 border ${SIGNAL_CHIP[d.signal]}`}>
              <div className="text-xl font-bold mb-1">{SIGNAL_ICON[d.signal]}</div>
              <div className="text-xs font-bold uppercase tracking-wide mb-1">{DIM_LABELS[dim]}</div>
              <div className="text-xs">{d.observations[0]}</div>
            </div>
          )
        })}
      </div>

      {/* Detailed observations for alerte/partiel */}
      {dims.map(dim => {
        const d = report[dim]
        if (!d || d.signal === 'ok') return null
        return (
          <div key={dim} className={`rounded px-4 py-3 ${SIGNAL_BANNER[d.signal]}`}>
            <div className="font-semibold text-sm mb-1">{DIM_LABELS[dim]} — à investiguer</div>
            <ul className="text-sm space-y-1 list-disc list-inside text-gray-700">
              {d.observations.map((o, i) => <li key={i}>{o}</li>)}
            </ul>
          </div>
        )
      })}

      {/* Global observations — editable if onEditGlobales provided */}
      <div className="bg-jfb-beige rounded p-4">
        <div className="font-semibold text-sm text-jfb-noir mb-2">Observations pour l&apos;accompagnant</div>
        {onEditGlobales ? (
          <textarea
            value={editableGlobales ?? report.observations_globales}
            onChange={e => onEditGlobales(e.target.value)}
            className="w-full min-h-24 text-sm leading-relaxed bg-white border border-jfb-bordure rounded p-2 resize-y focus:outline-none focus:border-jfb-noir"
            aria-label="Observations pour l'accompagnant — éditables avant enregistrement"
          />
        ) : (
          <p className="text-sm text-gray-700 leading-relaxed">{report.observations_globales}</p>
        )}
      </div>

      {/* Transcript excerpts */}
      {report.extraits?.length > 0 && (
        <div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Extraits de la transcription</div>
          <div className="space-y-3">
            {report.extraits.map((e, i) => (
              <div key={i} className="border border-jfb-bordure rounded p-3 text-sm">
                <div className="font-semibold text-emerald-700 mb-1">Jury : <span className="text-jfb-noir font-normal">{e.question}</span></div>
                <div className="text-gray-600">Élève : <em>{e.reponse}</em>
                  {e.hesitation_sec > 5 && <span className="text-red-500 ml-2 text-xs">[{e.hesitation_sec}s de réflexion]</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer with RISS citations */}
      <div className="text-xs text-gray-400 border-t border-jfb-bordure pt-3">
        Ce rapport est une aide à l&apos;accompagnement, pas une évaluation officielle — PLAI Liège<br/>
        <span className="italic">
          Appuyé sur : Zollinger A. (2024) — corpus RISS ·{' '}
          Philippon A.-L. (2022) — RISS, évaluation en simulation, hors contexte TFE direct
        </span>
      </div>
    </div>
  )
}
