'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login')
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
    if (password.length < 6) {
      setError('6 caractères minimum.')
      setLoading(false)
      return
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      setError(error.message)
    } else if (data.session) {
      setLoading(false)
      router.refresh()
      router.push('/')
      return
    } else {
      setSuccess('Compte créé ! Vérifiez votre email pour confirmer votre inscription, puis connectez-vous.')
      setMode('login')
    }
    setLoading(false)
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

  const handleSubmit =
    mode === 'login' ? handleLogin : mode === 'signup' ? handleSignup : handleReset

  return (
    <div className="min-h-screen bg-jfb-subtil flex items-center justify-center p-4">
      <div className="bg-white border border-jfb-bordure rounded-lg p-8 w-full max-w-md">
        <Image src="/plai-logo.jpg" alt="PLAI" width={120} height={48} className="mb-6 object-contain" />
        <h1 className="text-xl font-bold text-jfb-noir mb-6">
          {mode === 'login' ? 'Connexion JuryActif' : mode === 'signup' ? 'Créer un compte' : 'Mot de passe oublié'}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-jfb-gris mb-1">Adresse email</label>
            <input
              id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="prenom.nom@enseignement.be" required
              className="w-full border border-jfb-bordure rounded px-3 py-2 text-sm focus:outline-none focus:border-jfb-noir"
            />
          </div>
          {mode !== 'reset' && (
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-jfb-gris mb-1">Mot de passe</label>
              <input
                id="password" type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required minLength={mode === 'signup' ? 6 : undefined}
                className="w-full border border-jfb-bordure rounded px-3 py-2 text-sm focus:outline-none focus:border-jfb-noir"
              />
              {mode === 'signup' && (
                <p className="text-xs text-jfb-gris-cl mt-1">Minimum 6 caractères.</p>
              )}
            </div>
          )}
          {error && <p className="text-red-600 text-sm">{error}</p>}
          {success && <p className="text-green-700 text-sm">{success}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-jfb-noir text-white py-2 rounded text-sm font-semibold disabled:opacity-50">
            {loading ? '…' : mode === 'login' ? 'Se connecter' : mode === 'signup' ? 'Créer mon compte' : 'Envoyer le lien'}
          </button>
        </form>

        <div className="mt-4 text-center space-y-2">
          {mode !== 'reset' && (
            <button
              type="button"
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); setSuccess(null) }}
              className="block w-full text-xs text-jfb-gris-cl hover:text-jfb-noir underline"
            >
              {mode === 'login' ? "Pas encore de compte ? Créer un compte" : 'Déjà un compte ? Se connecter'}
            </button>
          )}
          {mode === 'login' && (
            <button
              type="button"
              onClick={() => { setMode('reset'); setError(null); setSuccess(null) }}
              className="block w-full text-xs text-jfb-gris-cl hover:text-jfb-noir underline"
            >
              Mot de passe oublié ?
            </button>
          )}
          {mode === 'reset' && (
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); setSuccess(null) }}
              className="block w-full text-xs text-jfb-gris-cl hover:text-jfb-noir underline"
            >
              ← Retour à la connexion
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
