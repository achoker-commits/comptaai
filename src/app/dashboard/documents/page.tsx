import { createClient } from '@/lib/supabase/server'
import { DocumentUpload } from '@/components/dashboard/document-upload'
import { DocumentList } from '@/components/dashboard/document-list'

export default async function DocumentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: companies } = await supabase
    .from('companies')
    .select('id, name')
    .eq('user_id', user!.id)

  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        <p className="text-gray-500 mt-1">Importez vos factures, reçus et relevés bancaires</p>
      </div>

      <DocumentUpload companies={companies || []} />

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Documents importés ({(documents || []).length})
        </h2>
        <DocumentList documents={documents || []} />
      </div>
    </div>
  )
}
