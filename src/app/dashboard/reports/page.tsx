import { createClient } from '@/lib/supabase/server'
import { ReportGenerator } from '@/components/dashboard/report-generator'

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: companies } = await supabase
    .from('companies')
    .select('id, name')
    .eq('user_id', user!.id)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Rapports</h1>
        <p className="text-gray-500 mt-1">Générez vos rapports comptables automatiquement</p>
      </div>
      <ReportGenerator companies={companies || []} />
    </div>
  )
}
