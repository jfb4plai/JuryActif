import { truncateToLimit } from '@/lib/pdf-extractor'

test('truncateToLimit returns full text when under limit', () => {
  const text = 'hello world'
  const result = truncateToLimit(text, 100)
  expect(result.text).toBe(text)
  expect(result.truncated).toBe(false)
})

test('truncateToLimit cuts at word boundary under limit', () => {
  const text = 'hello world foo bar'
  const result = truncateToLimit(text, 11)
  expect(result.text.length).toBeLessThanOrEqual(11)
  expect(result.text).toBe('hello world')
  expect(result.truncated).toBe(true)
})

test('truncateToLimit returns slice start if no space found', () => {
  const text = 'abcdefghij'
  const result = truncateToLimit(text, 5)
  expect(result.text).toBe('abcde')
  expect(result.truncated).toBe(true)
})
