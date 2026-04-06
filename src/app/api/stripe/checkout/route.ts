import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCheckoutSession, createCustomer } from '@/lib/stripe'
import { PLANS, Plan } from '@/types'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Non autorisé' }, { status: 401 })

  const { plan } = await request.json()
  const planConfig = PLANS[plan as Plan]
  if (!planConfig) return Response.json({ error: 'Plan invalide' }, { status: 400 })

  // Récupérer ou créer le customer Stripe
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  let customerId = subscription?.stripe_customer_id

  if (!customerId) {
    const customer = await createCustomer(
      user.email!,
      user.user_metadata?.full_name || user.email!
    )
    customerId = customer.id
  }

  const session = await createCheckoutSession({
    customerId,
    priceId: planConfig.priceId,
    userId: user.id,
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
    cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
  })

  return Response.json({ url: session.url })
}
