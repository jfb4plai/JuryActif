import { buildQuestionPrompt } from '@/app/api/jury/next-question/prompt'
import type { QuestionType } from '@/lib/supabase/types'

const baseTfeResume = {
  titre: 'TFE',
  filiere: 'Sciences',
  resume: 'résumé',
  points_cles: ['p1'],
  citations_notables: ['cit1'],
}

test('buildQuestionPrompt includes question type label for paternite', () => {
  const prompt = buildQuestionPrompt({
    questionType: 'paternite',
    tfeResume: baseTfeResume,
    history: [],
    customQuestions: [],
    intensite: 'standard',
  })
  expect(prompt).toContain('paternité')
  expect(prompt).toContain('cit1')
})

test('buildQuestionPrompt includes custom question hint when type is perso', () => {
  const prompt = buildQuestionPrompt({
    questionType: 'perso' as QuestionType,
    tfeResume: { titre: 'TFE', filiere: 'Sciences', resume: 'résumé', points_cles: [], citations_notables: [] },
    history: [],
    customQuestions: [{ intitule: 'Pourquoi ce sujet ?', type: 'perso' as QuestionType }],
    intensite: 'standard',
  })
  expect(prompt).toContain('Pourquoi ce sujet ?')
})

test('buildQuestionPrompt does NOT include custom hint when no custom questions', () => {
  const prompt = buildQuestionPrompt({
    questionType: 'comprehension',
    tfeResume: baseTfeResume,
    history: [],
    customQuestions: [],
    intensite: 'standard',
  })
  expect(prompt).not.toContain('Questions personnalisées')
})

test('buildQuestionPrompt includes recent history', () => {
  const history = [{
    question: 'Question précédente',
    question_type: 'comprehension' as QuestionType,
    reponse: 'Réponse élève',
    hesitation_sec: 3,
    timestamp: new Date().toISOString(),
  }]
  const prompt = buildQuestionPrompt({
    questionType: 'maitrise',
    tfeResume: baseTfeResume,
    history,
    customQuestions: [],
    intensite: 'approfondi',
  })
  expect(prompt).toContain('Question précédente')
  expect(prompt).toContain('approfondi')
})
