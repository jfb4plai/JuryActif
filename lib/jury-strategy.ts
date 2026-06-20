import type { QuestionType } from './supabase/types'

export const STRATEGY_SEQUENCE: QuestionType[] = [
  'comprehension', 'comprehension', 'paternite',
  'maitrise', 'comprehension', 'paternite',
  'piege', 'maitrise', 'paternite', 'maitrise',
]

export function nextQuestionType(
  history: QuestionType[],
  totalExpected: number,
  intensite: 'standard' | 'approfondi'
): QuestionType {
  void intensite // reserved for Task 7 (approfondi mode will affect weights)

  const n = history.length
  const progress = n / totalExpected

  // Insert piege at ~40-60% of session
  if (progress >= 0.4 && progress < 0.6) {
    const hasHadPiege = history.includes('piege')
    if (!hasHadPiege) return 'piege'
  }

  // Near end: favour maitrise
  if (progress >= 0.8) return 'maitrise'

  // If last 2 answers were the same type, insert paternite for variety
  if (n >= 2 && history[n - 1] === history[n - 2]) return 'paternite'

  // Follow base sequence
  const idx = n % STRATEGY_SEQUENCE.length
  return STRATEGY_SEQUENCE[idx]
}
