import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createPortalSession } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY?.startsWith('sk_')) {
    return Response.json({ error: 'Stripe non configuré' }, { status: 503 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Non autorisé' }, { status: 401 })

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  if (!subscription?.stripe_customer_id) {
    return Response.json({ error: 'Aucun abonnement trouvé' }, { status: 404 })
  }

  const session = await createPortalSession(
    subscription.stripe_customer_id,
    `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`
  )

  return Response.json({ url: session.url })
}
