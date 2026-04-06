import { createClient } from '@/lib/supabase/server'
import { PLANS, Plan } from '@/types'

export async function getActiveSubscription() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  return sub
}

export async function checkPlanLimit(resource: 'companies' | 'docs_per_month'): Promise<{ allowed: boolean; reason?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { allowed: false, reason: 'Non authentifié' }

  const sub = await getActiveSubscription()
  if (!sub) return { allowed: false, reason: 'Aucun abonnement actif' }

  const plan = PLANS[sub.plan as Plan]

  if (resource === 'companies') {
    const { count } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if ((count ?? 0) >= plan.companies) {
      return { allowed: false, reason: `Limite de ${plan.companies} société(s) atteinte pour le plan ${plan.name}` }
    }
  }

  if (resource === 'docs_per_month') {
    if (plan.docs_per_month === 'unlimited') return { allowed: true }

    const firstOfMonth = new Date()
    firstOfMonth.setDate(1)
    firstOfMonth.setHours(0, 0, 0, 0)

    const { count } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', firstOfMonth.toISOString())

    if ((count ?? 0) >= (plan.docs_per_month as number)) {
      return { allowed: false, reason: `Limite de ${plan.docs_per_month} documents/mois atteinte pour le plan ${plan.name}` }
    }
  }

  return { allowed: true }
}
