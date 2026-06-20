import { buildAnalyzePrompt } from '@/app/api/jury/analyze-tfe/prompt'

test('buildAnalyzePrompt includes titre', () => {
  const prompt = buildAnalyzePrompt('Les énergies solaires', 'Sciences', 'Texte du TFE…')
  expect(prompt).toContain('Les énergies solaires')
})

test('buildAnalyzePrompt includes filiere', () => {
  const prompt = buildAnalyzePrompt('Les énergies solaires', 'Sciences', 'Texte du TFE…')
  expect(prompt).toContain('Sciences')
})

test('buildAnalyzePrompt includes texte inside tfe tags', () => {
  const prompt = buildAnalyzePrompt('Les énergies solaires', 'Sciences', 'Texte du TFE…')
  expect(prompt).toContain('<tfe>')
  expect(prompt).toContain('Texte du TFE…')
  expect(prompt).toContain('</tfe>')
})

test('buildAnalyzePrompt requests JSON output', () => {
  const prompt = buildAnalyzePrompt('T', 'F', 'texte')
  expect(prompt).toContain('JSON')
  expect(prompt).toContain('citations_notables')
  expect(prompt).toContain('points_cles')
})
