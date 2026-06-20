'use client'
import { useState, useRef, useEffect } from 'react'

interface Props {
  onSend: (response: string, hesitationSec: number) => void
  disabled?: boolean
}

export default function StudentResponse({ onSend, disabled }: Props) {
  const [text, setText] = useState('')
  const startRef = useRef<number>(Date.now())
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    startRef.current = Date.now()
    if (!disabled) textareaRef.current?.focus()
  }, [disabled])

  const handleSend = () => {
    if (!text.trim() || disabled) return
    const hesitationSec = Math.round((Date.now() - startRef.current) / 1000)
    onSend(text.trim(), hesitationSec)
    setText('')
    startRef.current = Date.now()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="bg-white border border-jfb-bordure border-t-0 px-6 py-4">
      <div className="text-xs font-bold text-jfb-gris-cl uppercase tracking-widest mb-2">Ta réponse</div>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="Tape ta réponse ici… ou utilise Handy (Ctrl+Espace) pour dicter"
        className="w-full min-h-24 border border-jfb-bordure rounded p-3 text-sm leading-relaxed resize-y focus:outline-none focus:border-jfb-noir disabled:bg-jfb-subtil disabled:cursor-not-allowed"
        aria-label="Réponse à la question du jury"
      />
      <div className="flex justify-between items-center mt-3">
        <span className="text-xs text-jfb-gris-cl">Handy · Ctrl+Espace pour dicter · Ctrl+Entrée pour envoyer</span>
        <button
          type="button"
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          className="bg-jfb-noir text-white px-5 py-2 rounded text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Envoyer →
        </button>
      </div>
    </div>
  )
}
