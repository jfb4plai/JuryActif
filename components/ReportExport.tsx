'use client'
import type { ReportJson } from '@/lib/supabase/types'

const DIM_LABELS = {
  paternite: 'Paternité',
  comprehension: 'Compréhension',
  maitrise: 'Maîtrise du sujet',
  pieges: 'Questions pièges',
} as const

const SIGNALS = { alerte: '⚠', partiel: '~', ok: '✓' } as const

interface Props { report: ReportJson }

export default function ReportExport({ report }: Props) {
  const handleExport = async () => {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const margin = 20
    let y = margin

    const line = (text: string, size = 11, bold = false) => {
      doc.setFontSize(size)
      doc.setFont('helvetica', bold ? 'bold' : 'normal')
      const lines = doc.splitTextToSize(text, 170)
      doc.text(lines, margin, y)
      y += lines.length * (size * 0.45) + 3
    }

    line('Rapport JuryActif — PLAI Liège', 16, true)
    line(report.titre_tfe, 13, true)
    line(
      `${report.label_eleve ? report.label_eleve + ' · ' : ''}${new Date(report.date).toLocaleDateString('fr-BE')} · ${report.duree_reelle_min} min · ${report.nb_questions} questions`
    )
    y += 6

    const dims = ['paternite', 'comprehension', 'maitrise', 'pieges'] as const
    dims.forEach(dim => {
      const d = report[dim]
      if (!d) return
      line(`${SIGNALS[d.signal]} ${DIM_LABELS[dim]}`, 12, true)
      d.observations.forEach(o => line(`• ${o}`))
      y += 3
    })

    y += 3
    line("Observations pour l'accompagnant", 12, true)
    line(report.observations_globales)
    y += 6
    line("Ce rapport est une aide à l'accompagnement, pas une évaluation officielle. — PLAI Liège", 9)

    doc.save(`juryactif-${report.label_eleve || 'rapport'}-${new Date().toISOString().slice(0, 10)}.pdf`)
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      className="bg-plai-orange text-white px-5 py-2 rounded font-semibold text-sm hover:opacity-90"
    >
      Exporter PDF
    </button>
  )
}
