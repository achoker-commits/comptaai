'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PLANS, Plan } from '@/types'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = (searchParams.get('plan') || 'solo') as Plan

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, plan },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  const selectedPlan = PLANS[plan]

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="font-bold text-gray-900 text-lg">ComptaAI</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Créer un compte</h1>
          <p className="text-gray-500 mt-1">14 jours gratuits, sans carte bancaire</p>
        </div>

        {/* Plan sélectionné */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-900">Plan {selectedPlan.name}</p>
            <p className="text-xs text-blue-600">{selectedPlan.price}€/mois après l&apos;essai</p>
          </div>
          <Link href="/auth/register" className="text-xs text-blue-600 hover:underline">
            Changer
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              id="name"
              type="text"
              label="Nom complet"
              placeholder="Marie Dupont"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
            <Input
              id="email"
              type="email"
              label="Adresse email"
              placeholder="vous@exemple.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <Input
              id="password"
              type="password"
              label="Mot de passe"
              placeholder="8 caractères minimum"
              value={password}
              onChange={e => setPassword(e.target.value)}
              minLength={8}
              required
            />
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Créer mon compte gratuitement
            </Button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-4">
            En créant un compte, vous acceptez nos conditions d&apos;utilisation
          </p>

          <p className="text-center text-sm text-gray-500 mt-4">
            Déjà un compte ?{' '}
            <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  )
}
