import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
  typescript: true,
})

export async function createCustomer(email: string, name: string) {
  return stripe.customers.create({ email, name })
}

export async function createCheckoutSession({
  customerId,
  priceId,
  userId,
  successUrl,
  cancelUrl,
}: {
  customerId: string
  priceId: string
  userId: string
  successUrl: string
  cancelUrl: string
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://comptaai.fr'
  return stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { userId },
    // Conformité RGPD EU — affiche les liens CGV/Confidentialité dans Stripe Checkout
    custom_text: {
      terms_of_service_acceptance: {
        message: `En souscrivant, vous acceptez nos [Conditions générales](${appUrl}/terms) et notre [Politique de confidentialité](${appUrl}/privacy).`,
      },
    },
    consent_collection: {
      terms_of_service: 'required',
    },
    locale: 'fr',
  })
}

export async function createPortalSession(customerId: string, returnUrl: string) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
}
