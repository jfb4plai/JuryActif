'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-jfb-subtil flex items-center justify-center p-4">
      <div className="bg-white border border-jfb-bordure rounded-lg p-8 w-full max-w-md">
        <Image src="/plai-logo.jpg" alt="PLAI" width={120} height={48} className="mb-6 object-contain" />
        <h1 className="text-xl font-bold text-jfb-noir mb-6">Connexion JuryActif</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-jfb-gris mb-1">Adresse email</label>
            <input
              id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="prenom.nom@enseignement.be" required
              className="w-full border border-jfb-bordure rounded px-3 py-2 text-sm focus:outline-none focus:border-jfb-noir"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-xs font-medium text-jfb-gris mb-1">Mot de passe</label>
            <input
              id="password" type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" required
              className="w-full border border-jfb-bordure rounded px-3 py-2 text-sm focus:outline-none focus:border-jfb-noir"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-jfb-noir text-white py-2 rounded text-sm font-semibold disabled:opacity-50">
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
        <p className="text-xs text-jfb-gris-cl mt-6 text-center">
          Accès réservé aux enseignants PLAI Liège
        </p>
      </div>
    </div>
  )
}
