import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateReport } from '@/lib/ai/agent'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Non autorisé' }, { status: 401 })

  const { companyId, month, year } = await request.json()

  // Vérifier que la société appartient à l'utilisateur
  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('id', companyId)
    .eq('user_id', user.id)
    .single()

  if (!company) return Response.json({ error: 'Société non trouvée' }, { status: 404 })

  // Récupérer les transactions du mois
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('company_id', companyId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })

  const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

  const period = `${months[month - 1]} ${year}`
  const report = await generateReport(transactions || [], period, company.name)

  return Response.json({ report })
}
