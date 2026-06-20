import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import type { Exchange, ReportJson } from '@/lib/supabase/types'
import { buildReportPrompt } from './prompt'

// Lazy singleton — avoids SDK credential probing at module load time (keeps Jest clean)
let _client: Anthropic | null = null
function getClient(): Anthropic {
  if (!_client) _client = new Anthropic()
  return _client
}

export async function POST(request: NextRequest) {
  let body: {
    sessionId?: string
    titreTfe?: string
    history?: Exchange[]
    labelEleve?: string
    dureeReelleMin?: number
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corps JSON invalide' }, { status: 400 })
  }

  const { titreTfe, history, labelEleve, dureeReelleMin } = body

  if (!titreTfe || !Array.isArray(history)) {
    return NextResponse.json({ error: 'titreTfe et history requis' }, { status: 400 })
  }

  try {
    const message = await getClient().messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages: [{ role: 'user', content: buildReportPrompt(titreTfe, history) }],
    })

    const rawText = message.content[0].type === 'text' ? message.content[0].text : '{}'

    // Extract JSON from possible markdown fences
    const fenceMatch = rawText.match(/```(?:json)?\n?([\s\S]*?)\n?```/)
    const jsonText = (fenceMatch ? fenceMatch[1] : rawText).trim()

    const partial = JSON.parse(jsonText) as Partial<ReportJson>

    if (!partial.paternite || !partial.comprehension || !partial.maitrise || !partial.pieges) {
      return NextResponse.json({ error: 'Réponse IA incomplète — réessayez' }, { status: 500 })
    }

    const report: ReportJson = {
      titre_tfe: titreTfe,
      label_eleve: labelEleve ?? '',
      date: new Date().toISOString(),
      duree_reelle_min: dureeReelleMin ?? 0,
      nb_questions: history.length,
      paternite: partial.paternite,
      comprehension: partial.comprehension,
      maitrise: partial.maitrise,
      pieges: partial.pieges,
      extraits: partial.extraits ?? [],
      observations_globales: partial.observations_globales ?? '',
    }

    return NextResponse.json(report)
  } catch (e) {
    const msg = e instanceof SyntaxError
      ? 'Réponse IA non parseable — réessayez'
      : 'Erreur lors de la génération du rapport'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
