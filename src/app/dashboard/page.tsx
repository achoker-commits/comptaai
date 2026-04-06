import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const MONTH_SHORT = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: companies } = await supabase
    .from('companies')
    .select('*')
    .eq('user_id', user!.id)

  const companyIds = (companies || []).map(c => c.id)

  // Transactions du mois courant
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .in('company_id', companyIds.length ? companyIds : ['00000000-0000-0000-0000-000000000000'])
    .gte('date', startOfMonth)

  // Toutes les transactions (6 derniers mois) pour les graphiques
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
  sixMonthsAgo.setDate(1)
  const { data: allTransactions } = await supabase
    .from('transactions')
    .select('*')
    .in('company_id', companyIds.length ? companyIds : ['00000000-0000-0000-0000-000000000000'])
    .gte('date', sixMonthsAgo.toISOString().split('T')[0])

  const totalRevenue = (transactions || [])
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + (t.amount || 0), 0)

  const totalExpenses = (transactions || [])
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + (t.amount || 0), 0)

  // Données pour le bar chart (6 mois glissants)
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (5 - i))
    const m = d.getMonth()
    const y = d.getFullYear()
    const monthTx = (allTransactions || []).filter(t => {
      const td = new Date(t.date)
      return td.getMonth() === m && td.getFullYear() === y
    })
    return {
      month: MONTH_SHORT[m],
      recettes: monthTx.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0),
      depenses: monthTx.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0),
    }
  })

  // Données pour le pie chart (dépenses par catégorie ce mois)
  const categoryMap: Record<string, number> = {}
  ;(transactions || []).filter(t => t.type === 'debit').forEach(t => {
    categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount
  })
  const categoryData = Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)

  const { data: recentDocs } = await supabase
    .from('documents')
    .select('*')
    .in('company_id', companyIds.length ? companyIds : ['00000000-0000-0000-0000-000000000000'])
    .order('created_at', { ascending: false })
    .limit(5)

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'vous'

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Bonjour {firstName} 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Voici votre résumé comptable du mois en cours
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-2">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">Chiffre d&apos;affaires</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalRevenue)}</p>
            <p className="text-xs text-gray-400 mt-1">Ce mois-ci</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">Dépenses</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(totalExpenses)}</p>
            <p className="text-xs text-gray-400 mt-1">Ce mois-ci</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">Résultat net</p>
            <p className={`text-2xl font-bold mt-1 ${totalRevenue - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalRevenue - totalExpenses)}
            </p>
            <p className="text-xs text-gray-400 mt-1">Ce mois-ci</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">Sociétés</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{(companies || []).length}</p>
            <p className="text-xs text-gray-400 mt-1">Actives</p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <RevenueChart monthlyData={monthlyData} categoryData={categoryData} />

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        {/* Documents récents */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Documents récents</h2>
              <Link href="/dashboard/documents">
                <Button variant="ghost" size="sm">Voir tout</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {(recentDocs || []).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-4xl mb-3">📄</p>
                <p className="text-sm text-gray-500 mb-4">Aucun document importé</p>
                <Link href="/dashboard/documents">
                  <Button size="sm">Importer un document</Button>
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {(recentDocs || []).map(doc => (
                  <li key={doc.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">
                        {doc.type === 'invoice' ? '🧾' : doc.type === 'receipt' ? '🪙' : '🏦'}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[180px]">{doc.name}</p>
                        <p className="text-xs text-gray-500">{doc.category || 'Non catégorisé'}</p>
                      </div>
                    </div>
                    {doc.amount && (
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(doc.amount)}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Actions rapides */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Actions rapides</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { href: '/dashboard/documents', emoji: '📤', label: 'Importer un document', desc: 'Facture, reçu, relevé bancaire' },
                { href: '/dashboard/transactions', emoji: '💳', label: 'Ajouter une transaction', desc: 'Saisie manuelle recette ou dépense' },
                { href: '/dashboard/tva', emoji: '🧾', label: 'Calculer ma TVA', desc: 'Simulation déclaration CA3' },
                { href: '/dashboard/chat', emoji: '💬', label: 'Parler à l\'agent IA', desc: 'Posez vos questions comptables' },
                { href: '/dashboard/reports', emoji: '📑', label: 'Générer un rapport', desc: 'Rapport mensuel PDF automatique' },
              ].map(action => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group"
                >
                  <span className="text-2xl">{action.emoji}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 group-hover:text-blue-700">{action.label}</p>
                    <p className="text-xs text-gray-500">{action.desc}</p>
                  </div>
                  <span className="ml-auto text-gray-300 group-hover:text-blue-400">→</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
