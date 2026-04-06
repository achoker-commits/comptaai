'use client'

import { useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import { AddTransactionForm } from './add-transaction-form'

interface Transaction {
  id: string
  label: string
  amount: number
  type: 'debit' | 'credit'
  category: string
  pcg_account?: string
  tva_rate?: number
  tva_amount?: number
  date: string
}

interface Company { id: string; name: string }

interface Props {
  initialTransactions: Transaction[]
  companies: Company[]
  companyId?: string
}

const TYPE_LABELS: Record<string, string> = {
  credit: 'Recette',
  debit: 'Dépense',
}

export function TransactionsTable({ initialTransactions, companies }: Props) {
  const [transactions, setTransactions] = useState(initialTransactions)
  const [filter, setFilter] = useState<'all' | 'credit' | 'debit'>('all')
  const [search, setSearch] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  function handleAdded() {
    // Recharge via navigation refresh
    setRefreshKey(k => k + 1)
    window.location.reload()
  }

  const filtered = transactions
    .filter(t => filter === 'all' || t.type === filter)
    .filter(t => t.label.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase()))

  const totalCredits = filtered.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0)
  const totalDebits = filtered.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0)

  return (
    <div key={refreshKey}>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          {(['all', 'credit', 'debit'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f === 'all' ? 'Tout' : f === 'credit' ? 'Recettes' : 'Dépenses'}
            </button>
          ))}
        </div>
        <div className="flex gap-3 items-center">
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <AddTransactionForm companies={companies} onAdded={handleAdded} />
        </div>
      </div>

      {/* Totaux */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 rounded-xl p-4">
          <p className="text-xs text-green-600 font-medium">Recettes</p>
          <p className="text-xl font-bold text-green-700 mt-1">{formatCurrency(totalCredits)}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4">
          <p className="text-xs text-red-600 font-medium">Dépenses</p>
          <p className="text-xl font-bold text-red-700 mt-1">{formatCurrency(totalDebits)}</p>
        </div>
        <div className={`rounded-xl p-4 ${totalCredits - totalDebits >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
          <p className={`text-xs font-medium ${totalCredits - totalDebits >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>Résultat net</p>
          <p className={`text-xl font-bold mt-1 ${totalCredits - totalDebits >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
            {formatCurrency(totalCredits - totalDebits)}
          </p>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <p className="text-3xl mb-3">💳</p>
          <p className="text-gray-500 text-sm">Aucune transaction trouvée</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Libellé</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Catégorie</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">PCG</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">TVA</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Montant HT</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(t => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(t.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate">
                    {t.label}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.category}</td>
                  <td className="px-4 py-3">
                    {t.pcg_account ? (
                      <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        {t.pcg_account}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {t.tva_rate != null ? `${t.tva_rate}%` : '—'}
                    {t.tva_amount ? ` (${formatCurrency(t.tva_amount)})` : ''}
                  </td>
                  <td className={`px-4 py-3 text-right font-semibold ${t.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'credit' ? '+' : '-'}{formatCurrency(t.amount)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      t.type === 'credit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {TYPE_LABELS[t.type]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
