import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import type { TfeResume } from '@/lib/supabase/types'
import { buildAnalyzePrompt } from './prompt'

// Lazy singleton — avoids SDK credential probing at module load time (keeps Jest clean)
let _client: Anthropic | null = null
function getClient(): Anthropic {
  if (!_client) _client = new Anthropic()
  return _client
}

export async function POST(request: NextRequest) {
  let titre: string, filiere: string, texte: string
  try {
    const body = await request.json() as { titre?: string; filiere?: string; texte?: string }
    titre = body.titre ?? ''
    filiere = body.filiere ?? ''
    texte = body.texte ?? ''
  } catch {
    return NextResponse.json({ error: 'Corps de requête JSON invalide' }, { status: 400 })
  }

  if (!titre || !filiere || !texte) {
    return NextResponse.json({ error: 'titre, filiere et texte requis' }, { status: 400 })
  }

  if (texte.length > 50000) {
    return NextResponse.json({ error: 'Texte trop long (max 50 000 caractères)' }, { status: 400 })
  }

  try {
    const message = await getClient().messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages: [{ role: 'user', content: buildAnalyzePrompt(titre, filiere, texte) }],
    })

    const rawText = message.content[0].type === 'text' ? message.content[0].text : ''

    // Extract JSON from possible markdown fences (capture group handles preamble text)
    const fenceMatch = rawText.match(/```(?:json)?\n?([\s\S]*?)\n?```/)
    const jsonText = (fenceMatch ? fenceMatch[1] : rawText).trim()

    const resume = JSON.parse(jsonText) as TfeResume

    // Minimal type guard — catch malformed IA responses before they reach the client
    if (!resume.resume || !Array.isArray(resume.points_cles) || !Array.isArray(resume.citations_notables)) {
      return NextResponse.json({ error: 'Réponse IA incomplète — réessayez' }, { status: 500 })
    }

    return NextResponse.json(resume)
  } catch (e) {
    const msg = e instanceof SyntaxError
      ? 'Réponse IA non parseable — réessayez'
      : 'Erreur lors de l\'analyse du TFE'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
