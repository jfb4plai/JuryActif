'use client'
import { useEffect, useState, useCallback } from 'react'

interface Props {
  startedAt: Date
  dureeCibleMin: number
  onTimeUp: () => void
}

export default function SessionTimer({ startedAt, dureeCibleMin, onTimeUp }: Props) {
  const [elapsed, setElapsed] = useState(0)
  const total = dureeCibleMin * 60

  const handleTimeUp = useCallback(onTimeUp, [])

  useEffect(() => {
    const id = setInterval(() => {
      const secs = Math.floor((Date.now() - startedAt.getTime()) / 1000)
      setElapsed(secs)
      if (secs >= total) {
        clearInterval(id)
        handleTimeUp()
      }
    }, 1000)
    return () => clearInterval(id)
  }, [startedAt, total, handleTimeUp])

  const pct = Math.min(100, (elapsed / total) * 100)
  const remaining = Math.max(0, total - elapsed)
  const remMin = Math.floor(remaining / 60)
  const remSec = remaining % 60

  return (
    <div className="bg-jfb-subtil border border-jfb-bordure border-t-0 px-6 py-3 flex items-center gap-4">
      <div className="flex-1 bg-jfb-bordure rounded-full h-1.5">
        <div
          className="bg-plai-teal h-1.5 rounded-full transition-all"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={Math.round(pct)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Durée de la session"
        />
      </div>
      <span className="text-xs text-jfb-gris whitespace-nowrap">
        {remMin}:{remSec.toString().padStart(2, '0')} restantes
      </span>
    </div>
  )
}
