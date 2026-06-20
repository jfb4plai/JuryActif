// Pure helper — separated from route.ts so Next.js doesn't complain about
// non-HTTP exports in route files, while still being importable for tests.
import type { QuestionType, TfeResume, Exchange } from '@/lib/supabase/types'

export const TYPE_LABELS: Record<QuestionType, string> = {
  paternite:    'paternité (vérifier que l\'élève est bien l\'auteur)',
  comprehension:'compréhension (vérifier qu\'il comprend ce qu\'il a écrit)',
  maitrise:     'maîtrise du sujet (transfert, nuances, esprit critique)',
  piege:        'piège (reformulation trompeuse ou fausse affirmation à corriger)',
  perso:        'question personnalisée de l\'enseignant',
}

export interface BuildPromptArgs {
  questionType: QuestionType
  tfeResume: TfeResume
  history: Exchange[]
  customQuestions: { intitule: string; type: QuestionType }[]
  intensite: 'standard' | 'approfondi'
}

export function buildQuestionPrompt({ questionType, tfeResume, history, customQuestions, intensite }: BuildPromptArgs): string {
  const historyText = history.length === 0
    ? 'Aucun échange précédent — c\'est la première question.'
    : history.slice(-4).map(e => `Jury: ${e.question}\nÉlève: ${e.reponse}`).join('\n\n')

  const customHint = questionType === 'perso' && customQuestions.length > 0
    ? `\nQuestions personnalisées disponibles (choisis-en une ou inspire-toi) :\n${customQuestions.map(q => `- ${q.intitule}`).join('\n')}`
    : ''

  return `Tu es un jury de défense orale de TFE CESS (secondaire supérieur FWB). Tu as lu le travail de l'élève.

TFE : "${tfeResume.titre}" (filière : ${tfeResume.filiere})
Résumé : ${tfeResume.resume}
Points clés : ${tfeResume.points_cles.join(', ')}
Citations notables : ${tfeResume.citations_notables.slice(0, 3).join(' | ')}

Échanges précédents :
${historyText}
${customHint}

Tu dois poser UNE question de type : **${TYPE_LABELS[questionType]}**.

Intensité : ${intensite}${intensite === 'approfondi' ? ' — sois plus incisif, relance davantage' : ''}.

Règles absolues :
- Ton direct, neutre, sans bienveillance exagérée ni agressivité
- Question courte (1-2 phrases maximum)
- Si type "piège" : formule une affirmation légèrement incorrecte sur le TFE et demande à l'élève de réagir
- Si type "paternité" : ancre la question dans un passage précis du TFE (cite un extrait)
- Ne répète pas une question déjà posée dans l'historique
- Réponds UNIQUEMENT avec la question, sans préambule ni explication`
}
