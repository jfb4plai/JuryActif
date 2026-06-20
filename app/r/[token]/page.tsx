import { createClient } from '@/lib/supabase/server'
import SessionReport from '@/components/SessionReport'
import type { ReportJson } from '@/lib/supabase/types'

export default async function PublicReportPage({ params }: { params: { token: string } }) {
  const supabase = createClient()
  const { data } = await supabase
    .rpc('jury_get_report_by_token', { p_token: params.token })

  const row = Array.isArray(data) ? data[0] : data as { rapport_json: ReportJson } | null
  if (!row) {
    return <div className="p-10 text-center text-gray-500 text-sm">Rapport introuvable ou lien expiré.</div>
  }
  const report = row.rapport_json

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <p className="text-xs text-gray-400 mb-6 italic">
        Rapport partagé — accès lecture seule · Ne pas utiliser comme évaluation officielle
      </p>
      <SessionReport report={report} />
    </main>
  )
}
