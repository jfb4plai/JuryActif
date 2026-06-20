import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import type { QuestionType, Exchange, TfeResume } from '@/lib/supabase/types'
import { buildQuestionPrompt } from './prompt'

let _client: Anthropic | null = null
function getClient(): Anthropic {
  if (!_client) _client = new Anthropic()
  return _client
}

export async function POST(request: NextRequest) {
  let body: {
    sessionId?: string
    questionType?: QuestionType
    tfeResume?: TfeResume
    history?: Exchange[]
    customQuestions?: { intitule: string; type: QuestionType }[]
    intensite?: 'standard' | 'approfondi'
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corps JSON invalide' }, { status: 400 })
  }

  const { questionType, tfeResume, history, customQuestions, intensite } = body

  if (!questionType || !tfeResume) {
    return NextResponse.json({ error: 'questionType et tfeResume requis' }, { status: 400 })
  }

  try {
    const message = await getClient().messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      messages: [{
        role: 'user',
        content: buildQuestionPrompt({
          questionType,
          tfeResume,
          history: history ?? [],
          customQuestions: customQuestions ?? [],
          intensite: intensite ?? 'standard',
        }),
      }],
    })

    const question = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
    return NextResponse.json({ question, type: questionType })
  } catch {
    return NextResponse.json({ error: 'Erreur lors de la génération de la question' }, { status: 500 })
  }
}
