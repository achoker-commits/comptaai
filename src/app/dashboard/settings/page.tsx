import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { PLANS } from '@/types'
import { BillingButton } from '@/components/dashboard/billing-button'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user!.id)
    .single()

  const currentPlan = subscription ? PLANS[subscription.plan as keyof typeof PLANS] : null

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-500 mt-1">Gérez votre compte et votre abonnement</p>
      </div>

      {/* Profil */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Profil</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Nom</span>
              <span className="text-sm font-medium text-gray-900">
                {user?.user_metadata?.full_name || 'Non renseigné'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Email</span>
              <span className="text-sm font-medium text-gray-900">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Membre depuis</span>
              <span className="text-sm font-medium text-gray-900">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : '—'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Abonnement */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Abonnement</h2>
        </CardHeader>
        <CardContent>
          {subscription && currentPlan ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Plan {currentPlan.name}</p>
                  <p className="text-sm text-gray-500">{currentPlan.price}€/mois</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  subscription.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {subscription.status === 'active' ? 'Actif' : subscription.status}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Renouvellement le {new Date(subscription.current_period_end).toLocaleDateString('fr-FR')}
              </div>
              <ul className="space-y-1">
                {currentPlan.features.map(f => (
                  <li key={f} className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="text-blue-600">✓</span> {f}
                  </li>
                ))}
              </ul>
              <BillingButton />
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-4">Vous n&apos;avez pas encore d&apos;abonnement actif</p>
              <a href="/pricing" className="text-blue-600 hover:underline text-sm font-medium">
                Voir les offres →
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
