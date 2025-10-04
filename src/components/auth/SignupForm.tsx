'use client'

import { useState } from 'react'
import { useAuth } from '@/components/providers/ClientAuthProvider'
import { useRouter } from 'next/navigation'

export function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const { signUp } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await signUp(email, password)
    
    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      // Rediriger après inscription
      setTimeout(() => {
        router.push('/generate')
      }, 2000)
    }
    
    setLoading(false)
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto text-center">
        <div className="text-green-400 text-lg mb-4">
          ✅ Compte créé avec succès !
        </div>
        <p className="text-white/80">
          Vérifiez votre email pour confirmer votre compte.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Créer un compte</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            placeholder="ton@email.com"
            required
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            placeholder="••••••••"
            minLength={6}
            required
          />
          <p className="text-xs text-white/60 mt-1">
            Minimum 6 caractères
          </p>
        </div>

        {error && (
          <div className="text-red-400 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 disabled:opacity-50"
        >
          {loading ? 'Création...' : 'Créer mon compte'}
        </button>
      </form>
    </div>
  )
}
