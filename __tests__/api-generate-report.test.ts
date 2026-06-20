import { buildReportPrompt } from '@/app/api/jury/generate-report/prompt'
import type { Exchange } from '@/lib/supabase/types'

const history: Exchange[] = [
  { question: 'Q1', question_type: 'paternite', reponse: 'R1', hesitation_sec: 3, timestamp: '' },
  { question: 'Q2', question_type: 'comprehension', reponse: 'R2', hesitation_sec: 12, timestamp: '' },
]

test('buildReportPrompt includes all 4 dimension names', () => {
  const prompt = buildReportPrompt('Mon TFE', history)
  expect(prompt).toContain('paternite')
  expect(prompt).toContain('comprehension')
  expect(prompt).toContain('maitrise')
  expect(prompt).toContain('pieges')
})

test('buildReportPrompt includes transcript exchanges', () => {
  const prompt = buildReportPrompt('Mon TFE', history)
  expect(prompt).toContain('Q1')
  expect(prompt).toContain('R2')
})

test('buildReportPrompt includes hesitation info', () => {
  const prompt = buildReportPrompt('Mon TFE', history)
  expect(prompt).toContain('12')
})

test('buildReportPrompt includes TFE title', () => {
  const prompt = buildReportPrompt('Les Énergies Renouvelables', history)
  expect(prompt).toContain('Les Énergies Renouvelables')
})
