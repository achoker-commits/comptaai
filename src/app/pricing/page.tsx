import Link from 'next/link'
import { PLANS } from '@/types'
import { Button } from '@/components/ui/button'

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="font-bold text-gray-900">ComptaAI</span>
        </Link>
        <Link href="/auth/login">
          <Button variant="outline" size="sm">Se connecter</Button>
        </Link>
      </nav>

      <div className="py-20 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choisissez votre plan</h1>
          <p className="text-gray-500">14 jours gratuits · Sans carte bancaire · Résiliez à tout moment</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {(Object.entries(PLANS) as [string, (typeof PLANS)[keyof typeof PLANS]][]).map(([key, plan], i) => (
            <div
              key={key}
              className={`rounded-2xl p-8 ${i === 1 ? 'bg-blue-600 ring-2 ring-blue-600' : 'bg-white border border-gray-200'}`}
            >
              {i === 1 && (
                <div className="text-xs font-semibold text-blue-200 mb-2 uppercase tracking-wide">
                  Recommandé
                </div>
              )}
              <h2 className={`text-2xl font-bold mb-2 ${i === 1 ? 'text-white' : 'text-gray-900'}`}>
                {plan.name}
              </h2>
              <div className={`text-4xl font-bold mb-6 ${i === 1 ? 'text-white' : 'text-gray-900'}`}>
                {plan.price}€<span className={`text-base font-normal ${i === 1 ? 'text-blue-200' : 'text-gray-500'}`}>/mois</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <span className={i === 1 ? 'text-blue-200' : 'text-blue-600'}>✓</span>
                    <span className={i === 1 ? 'text-blue-100' : 'text-gray-700'}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link href={`/auth/register?plan=${key}`} className="block">
                <Button
                  size="lg"
                  className={`w-full ${i === 1 ? 'bg-white text-blue-600 hover:bg-blue-50' : ''}`}
                  variant={i !== 1 ? 'default' : 'ghost'}
                >
                  Commencer gratuitement
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
