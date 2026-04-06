import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Non autorisé' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const companyId = searchParams.get('company_id')
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  const { data: companies } = await supabase
    .from('companies')
    .select('id, name')
    .eq('user_id', user.id)

  const companyIds = (companies || []).map(c => c.id)
  if (!companyIds.length) {
    return new Response('Aucune société', { status: 404 })
  }

  let query = supabase
    .from('transactions')
    .select('*, companies(name)')
    .in('company_id', companyId ? [companyId] : companyIds)
    .order('date', { ascending: false })

  if (from) query = query.gte('date', from)
  if (to) query = query.lte('date', to)

  const { data: transactions } = await query

  // Génération CSV
  const headers = [
    'Date',
    'Société',
    'Libellé',
    'Type',
    'Catégorie',
    'Compte PCG',
    'Montant HT (€)',
    'Taux TVA (%)',
    'TVA (€)',
    'Montant TTC (€)',
  ]

  const rows = (transactions || []).map(t => {
    const tvaRate = t.tva_rate ?? 20
    const tvaAmount = t.tva_amount ?? (t.amount * tvaRate / 100)
    const ttc = t.amount + tvaAmount
    const companyName = (t.companies as { name: string } | null)?.name || ''
    return [
      t.date,
      companyName,
      `"${t.label.replace(/"/g, '""')}"`,
      t.type === 'credit' ? 'Recette' : 'Dépense',
      t.category,
      t.pcg_account || '',
      t.amount.toFixed(2),
      tvaRate.toString(),
      tvaAmount.toFixed(2),
      ttc.toFixed(2),
    ].join(';')
  })

  const csv = [headers.join(';'), ...rows].join('\n')
  const bom = '\uFEFF' // BOM UTF-8 pour Excel français

  const filename = `comptaai-export-${new Date().toISOString().split('T')[0]}.csv`

  return new Response(bom + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
