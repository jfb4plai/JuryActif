import { truncateToLimit } from '@/lib/pdf-extractor'

test('truncateToLimit returns full text when under limit', () => {
  const text = 'hello world'
  expect(truncateToLimit(text, 100)).toBe(text)
})

test('truncateToLimit cuts at word boundary under limit', () => {
  const text = 'hello world foo bar'
  const result = truncateToLimit(text, 11)
  expect(result.length).toBeLessThanOrEqual(11)
  expect(result).toBe('hello world')
})

test('truncateToLimit returns slice start if no space found', () => {
  const text = 'abcdefghij'
  const result = truncateToLimit(text, 5)
  expect(result).toBe('abcde')
})
