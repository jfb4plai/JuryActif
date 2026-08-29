'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password.length < 6) {
      setError('6 caractères minimum.')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    setSuccess(true)
    setTimeout(() => {
      router.refresh()
      router.push('/')
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-jfb-subtil flex items-center justify-center p-4">
      <div className="bg-white border border-jfb-bordure rounded-lg p-8 w-full max-w-md">
        <Image src="/plai-logo.jpg" alt="PLAI" width={120} height={48} className="mb-6 object-contain" />
        <h1 className="text-xl font-bold text-jfb-noir mb-6">Nouveau mot de passe</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-xs font-medium text-jfb-gris mb-1">Nouveau mot de passe</label>
            <input
              id="password" type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="6 caractères minimum" required minLength={6}
              className="w-full border border-jfb-bordure rounded px-3 py-2 text-sm focus:outline-none focus:border-jfb-noir"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          {success && <p className="text-green-700 text-sm">Mot de passe mis à jour. Redirection...</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-jfb-noir text-white py-2 rounded text-sm font-semibold disabled:opacity-50">
            {loading ? '…' : 'Enregistrer'}
          </button>
        </form>
      </div>
    </div>
  )
}
