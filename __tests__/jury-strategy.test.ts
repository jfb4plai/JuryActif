import { nextQuestionType, STRATEGY_SEQUENCE } from '@/lib/jury-strategy'
import type { QuestionType } from '@/lib/supabase/types'

test('STRATEGY_SEQUENCE starts with comprehension', () => {
  expect(STRATEGY_SEQUENCE[0]).toBe('comprehension')
})

test('nextQuestionType returns piege at mid-session', () => {
  const history: QuestionType[] = ['comprehension', 'comprehension', 'paternite', 'maitrise']
  expect(nextQuestionType(history, 8, 'standard')).toBe('piege')
})

test('nextQuestionType returns maitrise near end', () => {
  const history: QuestionType[] = new Array(9).fill('comprehension')
  expect(nextQuestionType(history, 10, 'standard')).toBe('maitrise')
})

test('nextQuestionType inserts paternite if last 2 were identical', () => {
  const history: QuestionType[] = ['comprehension', 'comprehension']
  expect(nextQuestionType(history, 10, 'standard')).toBe('paternite')
})
