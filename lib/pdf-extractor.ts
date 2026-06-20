import type { TextItem } from 'pdfjs-dist/types/src/display/api'

const MAX_CHARS = 40000

export function truncateToLimit(text: string, limit = MAX_CHARS): string {
  if (text.length <= limit) return text
  const cut = text.lastIndexOf(' ', limit)
  return cut > 0 ? text.slice(0, cut) : text.slice(0, limit)
}

export async function extractTextFromPdf(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  if (pdf.numPages > 50) {
    throw new Error(`Le PDF contient ${pdf.numPages} pages. Limite : 50 pages.`)
  }

  const pages: string[] = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    pages.push(
      content.items
        .filter((item): item is TextItem => 'str' in item)
        .map(item => item.str)
        .join(' ')
    )
  }
  return truncateToLimit(pages.join('\n'))
}
