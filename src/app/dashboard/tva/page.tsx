import { createClient } from '@/lib/supabase/server'
import { TvaCalculator } from '@/components/dashboard/tva-calculator'

export default async function TvaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: companies } = await supabase
    .from('companies')
    .select('id, name')
    .eq('user_id', user!.id)

  const companyIds = (companies || []).map(c => c.id)

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .in('company_id', companyIds.length ? companyIds : ['00000000-0000-0000-0000-000000000000'])
    .order('date', { ascending: false })

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Déclaration TVA</h1>
        <p className="text-gray-500 mt-1">
          Simulez votre CA3 mensuel ou trimestriel · TVA collectée, déductible et net à payer
        </p>
      </div>

      <TvaCalculator
        transactions={transactions || []}
        companies={companies || []}
      />
    </div>
  )
}
