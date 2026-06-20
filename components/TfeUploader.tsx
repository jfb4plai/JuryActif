'use client'
import { useState, useRef } from 'react'
import { extractTextFromPdf } from '@/lib/pdf-extractor'

interface Props {
  onExtracted: (text: string, filename: string) => void
}

export default function TfeUploader({ onExtracted }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'upload' | 'paste'>('upload')
  const [pastedText, setPastedText] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setLoading(true)
    setError(null)
    try {
      const text = await extractTextFromPdf(file)
      onExtracted(text, file.name.replace(/\.pdf$/i, ''))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la lecture du PDF.')
    } finally {
      setLoading(false)
    }
  }

  const handlePaste = () => {
    if (pastedText.trim().length < 100) {
      setError('Le texte collé est trop court (minimum 100 caractères).')
      return
    }
    setError(null)
    onExtracted(pastedText.trim(), 'TFE (texte collé)')
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`text-sm px-4 py-1.5 rounded border ${mode === 'upload' ? 'bg-jfb-noir text-white border-jfb-noir' : 'border-jfb-bordure text-jfb-gris'}`}
        >
          Uploader un PDF
        </button>
        <button
          type="button"
          onClick={() => setMode('paste')}
          className={`text-sm px-4 py-1.5 rounded border ${mode === 'paste' ? 'bg-jfb-noir text-white border-jfb-noir' : 'border-jfb-bordure text-jfb-gris'}`}
        >
          Coller le texte
        </button>
      </div>

      {mode === 'upload' && (
        <div>
          <div
            onClick={() => !loading && fileRef.current?.click()}
            onKeyDown={e => {
              if ((e.key === 'Enter' || e.key === ' ') && !loading) {
                e.preventDefault()
                fileRef.current?.click()
              }
            }}
            onDragOver={e => { e.preventDefault(); e.stopPropagation() }}
            onDrop={e => {
              e.preventDefault()
              e.stopPropagation()
              if (loading) return
              const file = e.dataTransfer.files?.[0]
              if (file) handleFile(file)
            }}
            role="button"
            tabIndex={0}
            aria-label="Zone de dépôt PDF — cliquez ou déposez un fichier"
            aria-disabled={loading}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors focus:outline-none focus:border-jfb-noir ${loading ? 'border-jfb-bordure cursor-not-allowed' : 'border-jfb-bordure cursor-pointer hover:border-jfb-gris'}`}
          >
            {loading
              ? <p className="text-jfb-gris text-sm">Extraction en cours…</p>
              : (
                <p className="text-jfb-gris text-sm">
                  Cliquez ou déposez votre PDF ici<br />
                  <span className="text-xs text-jfb-gris-cl">Max 50 pages</span>
                </p>
              )
            }
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <p className="text-xs text-jfb-gris-cl mt-2">
            Le texte est extrait localement — le PDF ne quitte jamais votre navigateur.
          </p>
        </div>
      )}

      {mode === 'paste' && (
        <div className="space-y-2">
          <textarea
            value={pastedText}
            onChange={e => setPastedText(e.target.value)}
            placeholder="Colle ici le contenu de ton TFE (texte complet ou extraits significatifs)…"
            className="w-full h-48 border border-jfb-bordure rounded p-3 text-sm resize-none focus:outline-none focus:border-jfb-noir"
          />
          <p className="text-xs text-jfb-gris-cl">
            Minimum 100 caractères. Le jury IA utilisera ce texte comme base de ses questions.
          </p>
          <button
            type="button"
            onClick={handlePaste}
            className="bg-jfb-noir text-white px-4 py-2 rounded text-sm font-semibold"
          >
            Utiliser ce texte
          </button>
        </div>
      )}

      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  )
}
