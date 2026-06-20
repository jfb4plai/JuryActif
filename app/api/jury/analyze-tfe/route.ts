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
      max_tokens: 1024,
      messages: [{ role: 'user', content: buildAnalyzePrompt(titre, filiere, texte) }],
    })

    const rawText = message.content[0].type === 'text' ? message.content[0].text : ''

    // Strip markdown code fences if Haiku wraps JSON in ```json ... ```
    const jsonText = rawText.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()

    const resume = JSON.parse(jsonText) as TfeResume
    return NextResponse.json(resume)
  } catch (e) {
    const msg = e instanceof SyntaxError
      ? 'Réponse IA non parseable — réessayez'
      : 'Erreur lors de l\'analyse du TFE'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
