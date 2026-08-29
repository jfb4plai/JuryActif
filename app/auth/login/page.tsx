'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const ACCESS_REQUEST_EMAIL = 'jeanfrancois.beguin@ens.ecl.be'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'reset'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      const msg = error.message.toLowerCase().includes('invalid')
        ? 'Email ou mot de passe incorrect.'
        : 'Erreur de connexion. Réessayez dans quelques instants.'
      setError(msg)
      setLoading(false)
      return
    }
    setLoading(false)
    router.refresh()
    router.push('/')
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    })
    if (error) {
      setError(error.message)
    } else {
      setSuccess('Email envoyé ! Vérifiez votre boîte mail pour créer un nouveau mot de passe.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-jfb-subtil flex items-center justify-center p-4">
      <div className="bg-white border border-jfb-bordure rounded-lg p-8 w-full max-w-md">
        <Image src="/plai-logo.jpg" alt="PLAI" width={120} height={48} className="mb-6 object-contain" />
        <h1 className="text-xl font-bold text-jfb-noir mb-6">
          {mode === 'login' ? 'Connexion JuryActif' : 'Mot de passe oublié'}
        </h1>
        <form onSubmit={mode === 'login' ? handleLogin : handleReset} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-jfb-gris mb-1">Adresse email</label>
            <input
              id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="prenom.nom@enseignement.be" required
              className="w-full border border-jfb-bordure rounded px-3 py-2 text-sm focus:outline-none focus:border-jfb-noir"
            />
          </div>
          {mode === 'login' && (
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-jfb-gris mb-1">Mot de passe</label>
              <input
                id="password" type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required
                className="w-full border border-jfb-bordure rounded px-3 py-2 text-sm focus:outline-none focus:border-jfb-noir"
              />
            </div>
          )}
          {error && <p className="text-red-600 text-sm">{error}</p>}
          {success && <p className="text-green-700 text-sm">{success}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-jfb-noir text-white py-2 rounded text-sm font-semibold disabled:opacity-50">
            {loading ? '…' : mode === 'login' ? 'Se connecter' : 'Envoyer le lien'}
          </button>
        </form>

        <div className="mt-4 text-center space-y-2">
          {mode === 'login' ? (
            <button
              type="button"
              onClick={() => { setMode('reset'); setError(null); setSuccess(null) }}
              className="text-xs text-jfb-gris-cl hover:text-jfb-noir underline"
            >
              Mot de passe oublié ?
            </button>
          ) : (
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); setSuccess(null) }}
              className="text-xs text-jfb-gris-cl hover:text-jfb-noir underline"
            >
              ← Retour à la connexion
            </button>
          )}
        </div>

        <p className="text-xs text-jfb-gris-cl mt-6 text-center">
          Accès réservé aux enseignants PLAI Liège —{' '}
          <a
            href={`mailto:${ACCESS_REQUEST_EMAIL}?subject=${encodeURIComponent("Demande d'accès JuryActif")}&body=${encodeURIComponent('Nom : (à compléter)\nÉcole / Pôle : (à compléter)\n\nMerci de créer mon compte sur JuryActif.')}`}
            className="underline hover:text-jfb-noir"
          >
            demander un accès
          </a>
        </p>
      </div>
    </div>
  )
}
