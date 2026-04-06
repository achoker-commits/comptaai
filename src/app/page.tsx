import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PLANS } from '@/types'

const features = [
  {
    emoji: '📄',
    title: 'Import intelligent de documents',
    desc: 'Factures, reçus, relevés bancaires — uploadez et l\'IA extrait tout automatiquement.',
  },
  {
    emoji: '🧮',
    title: 'Comptabilité automatique',
    desc: 'Catégorisation PCG, calcul TVA, bilan et compte de résultat générés en un clic.',
  },
  {
    emoji: '💬',
    title: 'Agent comptable 24h/24',
    desc: 'Posez vos questions comptables et fiscales à tout moment, réponse immédiate.',
  },
  {
    emoji: '📊',
    title: 'Tableaux de bord en temps réel',
    desc: 'Visualisez vos finances, dépenses par catégorie et évolution du CA.',
  },
  {
    emoji: '🔒',
    title: 'Données sécurisées',
    desc: 'Chaque société est isolée. Vos données sont chiffrées et protégées.',
  },
  {
    emoji: '📑',
    title: 'Rapports PDF automatiques',
    desc: 'Recevez votre rapport mensuel professionnel prêt à partager.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 w-full border-b border-gray-100 bg-white/80 backdrop-blur-sm z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="font-bold text-gray-900 text-lg">ComptaAI</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="#pricing" className="text-sm text-gray-600 hover:text-gray-900">
                Tarifs
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" size="sm">Se connecter</Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">Essai gratuit 14 jours</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm text-blue-700 mb-6">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse inline-block" />
            Agent IA disponible 24h/24 · 7j/7
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Votre comptable IA<br />
            <span className="text-blue-600">toujours disponible</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Uploadez vos documents, obtenez une comptabilité automatique,
            des rapports professionnels et un agent qui répond à toutes vos questions fiscales.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/auth/register">
              <Button size="lg">Commencer gratuitement</Button>
            </Link>
            <Link href="#pricing">
              <Button variant="outline" size="lg">Voir les tarifs</Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            14 jours d&apos;essai gratuit · Sans carte bancaire · Résiliation à tout moment
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '< 30s', label: 'Analyse d\'un document' },
              { value: '99.9%', label: 'Disponibilité' },
              { value: '100%', label: 'Conforme PCG français' },
              { value: '24h/24', label: 'Support IA' },
            ].map(stat => (
              <div key={stat.label}>
                <div className="text-3xl font-bold text-blue-600">{stat.value}</div>
                <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Tout ce dont vous avez besoin
          </h2>
          <p className="text-center text-gray-600 mb-12">
            Une plateforme complète pour gérer la comptabilité de votre entreprise
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map(f => (
              <div key={f.title} className="p-6 rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-sm transition-all">
                <div className="text-3xl mb-4">{f.emoji}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 bg-gray-50">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Tarifs simples et transparents
          </h2>
          <p className="text-center text-gray-600 mb-12">
            Sans surprise. Résiliez à tout moment.
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {(Object.entries(PLANS) as [string, (typeof PLANS)[keyof typeof PLANS]][]).map(([key, plan], i) => (
              <div
                key={key}
                className={`rounded-2xl p-8 ${i === 1 ? 'bg-blue-600 text-white ring-2 ring-blue-600 scale-105' : 'bg-white border border-gray-200'}`}
              >
                {i === 1 && (
                  <div className="text-xs font-semibold text-blue-200 mb-2 uppercase tracking-wide">
                    Le plus populaire
                  </div>
                )}
                <h3 className={`text-xl font-bold mb-1 ${i === 1 ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <div className={`text-4xl font-bold mb-6 ${i === 1 ? 'text-white' : 'text-gray-900'}`}>
                  {plan.price}€
                  <span className={`text-base font-normal ${i === 1 ? 'text-blue-200' : 'text-gray-500'}`}>/mois</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <span className={`flex-shrink-0 ${i === 1 ? 'text-blue-200' : 'text-blue-600'}`}>✓</span>
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
                    Commencer
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-6 w-6 rounded bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">C</span>
            </div>
            <span className="font-bold text-gray-900">ComptaAI</span>
          </div>
          <p className="text-sm text-gray-500">
            © 2026 ComptaAI. Les analyses sont indicatives et ne remplacent pas un expert-comptable certifié.
          </p>
          <div className="flex items-center justify-center gap-4 mt-3">
            <Link href="/privacy" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Confidentialité</Link>
            <span className="text-gray-300">·</span>
            <Link href="/terms" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">CGU</Link>
            <span className="text-gray-300">·</span>
            <a href="mailto:contact@comptaai.fr" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
