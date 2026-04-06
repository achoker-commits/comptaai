import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { chatWithAgent } from '@/lib/ai/agent'
import { getActiveSubscription } from '@/lib/subscription'

// Rate limiting en mémoire (100 requêtes/heure par utilisateur)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 100
const RATE_WINDOW_MS = 60 * 60 * 1000

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(userId)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Non autorisé' }, { status: 401 })

  const sub = await getActiveSubscription()
  if (!sub) return Response.json({ error: 'Abonnement requis pour utiliser le coach IA' }, { status: 403 })

  if (!checkRateLimit(user.id)) {
    return Response.json({ error: 'Limite de 100 messages/heure atteinte' }, { status: 429 })
  }

  const { messages, companyId } = await request.json()

  // Récupérer le contexte de la société
  let companyContext = 'Société non spécifiée'
  if (companyId) {
    const { data: company } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .eq('user_id', user.id)
      .single()

    if (company) {
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('company_id', companyId)
        .order('date', { ascending: false })
        .limit(20)

      const totalRevenue = (transactions || [])
        .filter(t => t.type === 'credit')
        .reduce((sum, t) => sum + t.amount, 0)
      const totalExpenses = (transactions || [])
        .filter(t => t.type === 'debit')
        .reduce((sum, t) => sum + t.amount, 0)

      companyContext = `
Société : ${company.name}
SIRET : ${company.siret || 'Non renseigné'}
TVA : ${company.vat_number || 'Non renseigné'}
Adresse : ${company.address || 'Non renseignée'}

Résumé financier récent :
- Chiffre d'affaires (20 dernières transactions) : ${totalRevenue.toFixed(2)}€
- Dépenses (20 dernières transactions) : ${totalExpenses.toFixed(2)}€
- Résultat net : ${(totalRevenue - totalExpenses).toFixed(2)}€

Dernières transactions :
${(transactions || []).slice(0, 10).map(t =>
  `- ${t.date} | ${t.label} | ${t.type === 'credit' ? '+' : '-'}${t.amount}€ | ${t.category}`
).join('\n')}`
    }
  }

  const reply = await chatWithAgent(messages, companyContext)

  return Response.json({ reply })
}
