import { createClient } from '@/lib/supabase/server'
import { ChatInterface } from '@/components/dashboard/chat-interface'

export default async function ChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: companies } = await supabase
    .from('companies')
    .select('id, name')
    .eq('user_id', user!.id)

  return (
    <div className="flex flex-col h-full">
      <div className="px-8 py-6 border-b border-gray-200 bg-white">
        <h1 className="text-2xl font-bold text-gray-900">Agent comptable IA</h1>
        <p className="text-gray-500 mt-1">Posez toutes vos questions comptables et fiscales</p>
      </div>
      <ChatInterface companies={companies || []} />
    </div>
  )
}
