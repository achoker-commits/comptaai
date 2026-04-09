export type Plan = 'solo' | 'pro' | 'expert'

export interface Company {
  id: string
  user_id: string
  name: string
  siret?: string
  vat_number?: string
  address?: string
  created_at: string
  thread_id?: string // mémoire agent IA
}

export interface Document {
  id: string
  company_id: string
  user_id: string
  name: string
  type: 'invoice' | 'receipt' | 'bank_statement' | 'other'
  storage_path: string
  amount?: number
  category?: string
  date?: string
  vendor?: string
  processed: boolean
  created_at: string
}

export interface Transaction {
  id: string
  company_id: string
  document_id?: string
  label: string
  amount: number
  type: 'debit' | 'credit'
  category: string
  pcg_account?: string
  tva_rate?: number
  tva_amount?: number
  date: string
  created_at: string
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string
  stripe_subscription_id: string
  plan: Plan
  status: 'active' | 'canceled' | 'past_due'
  current_period_end: string
}

export interface PlanConfig {
  name: string
  price: number
  companies: number
  docs_per_month: number | 'unlimited'
  features: string[]
  priceId: string
}

export const PLANS: Record<Plan, PlanConfig> = {
  solo: {
    name: 'Solo',
    price: 29,
    companies: 1,
    docs_per_month: 100,
    features: [
      '1 société',
      '100 documents/mois',
      'Agent IA comptable 24h/24',
      'Rapports PDF automatiques',
      'Calcul TVA',
    ],
    priceId: process.env.STRIPE_PRICE_SOLO || '',
  },
  pro: {
    name: 'Pro',
    price: 79,
    companies: 3,
    docs_per_month: 'unlimited',
    features: [
      '3 sociétés',
      'Documents illimités',
      'Agent IA comptable 24h/24',
      'Rapports PDF automatiques',
      'Calcul TVA',
      'Export Excel',
      'Tableau de bord analytique',
    ],
    priceId: process.env.STRIPE_PRICE_PRO || '',
  },
  expert: {
    name: 'Expert',
    price: 199,
    companies: 10,
    docs_per_month: 'unlimited',
    features: [
      '10 sociétés',
      'Documents illimités',
      'Agent IA comptable 24h/24',
      'Rapports PDF automatiques',
      'Calcul TVA',
      'Export Excel',
      'Tableau de bord analytique',
      'Suivi humain par le comptable',
      'Support prioritaire',
    ],
    priceId: process.env.STRIPE_PRICE_EXPERT || '',
  },
}
