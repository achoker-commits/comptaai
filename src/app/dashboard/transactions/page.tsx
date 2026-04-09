import { createClient } from '@/lib/supabase/server'
import { TransactionsTable } from '@/components/dashboard/transactions-table'

export default async function TransactionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: companies } = await supabase
    .from('companies')
    .select('id, name')
    .eq('user_id', user!.id)

  const companyIds = (companies || []).map(c => c.id)

  const transactions = companyIds.length ? (await supabase
    .from('transactions')
    .select('*')
    .in('company_id', companyIds)
    .order('date', { ascending: false })
  ).data : []

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <p className="text-gray-500 mt-1">
          Historique complet de vos recettes et dépenses
        </p>
      </div>

      <TransactionsTable
        initialTransactions={transactions || []}
        companies={companies || []}
      />
    </div>
  )
}
