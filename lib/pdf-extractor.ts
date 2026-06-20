import type { TextItem } from 'pdfjs-dist/types/src/display/api'

const MAX_CHARS = 150000
let workerConfigured = false

export function truncateToLimit(text: string, limit = MAX_CHARS): { text: string; truncated: boolean } {
  if (text.length <= limit) return { text, truncated: false }
  const cut = text.lastIndexOf(' ', limit)
  return { text: cut > 0 ? text.slice(0, cut) : text.slice(0, limit), truncated: true }
}

export async function extractTextFromPdf(file: File): Promise<{ text: string; truncated: boolean }> {
  if (file.type !== 'application/pdf') {
    throw new Error('Le fichier sélectionné n\'est pas un PDF.')
  }

  const pdfjsLib = await import('pdfjs-dist')
  if (!workerConfigured) {
    // HTTPS explicit — pas de protocol-relative pour éviter les proxies d'entreprise
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
    workerConfigured = true
  }

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  if (pdf.numPages > 80) {
    throw new Error(`Le PDF contient ${pdf.numPages} pages. Limite : 80 pages.`)
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

  const { text, truncated } = truncateToLimit(pages.join('\n'))
  if (text.trim().length < 50) {
    throw new Error('Aucun texte extractible. Le PDF est peut-être scanné sans OCR — collez le texte manuellement.')
  }
  return { text, truncated }
}
