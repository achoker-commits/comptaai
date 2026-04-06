'use client'

import { formatCurrency, formatDate } from '@/lib/utils'
import type { Document } from '@/types'

const typeEmoji: Record<string, string> = {
  invoice: '🧾',
  receipt: '🪙',
  bank_statement: '🏦',
  other: '📄',
}

const typeLabel: Record<string, string> = {
  invoice: 'Facture',
  receipt: 'Reçu',
  bank_statement: 'Relevé bancaire',
  other: 'Autre',
}

export function DocumentList({ documents }: { documents: Document[] }) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed border-gray-100 rounded-2xl">
        <p className="text-4xl mb-3">📭</p>
        <p className="text-gray-500">Aucun document importé</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Document</th>
            <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Type</th>
            <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Fournisseur</th>
            <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Catégorie</th>
            <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Date</th>
            <th className="text-right text-xs font-medium text-gray-500 px-6 py-3">Montant</th>
            <th className="text-center text-xs font-medium text-gray-500 px-6 py-3">Statut</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {documents.map(doc => (
            <tr key={doc.id} className="hover:bg-gray-50/50">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{typeEmoji[doc.type] || '📄'}</span>
                  <span className="text-sm font-medium text-gray-900 max-w-[200px] truncate">{doc.name}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">{typeLabel[doc.type] || doc.type}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{doc.vendor || '—'}</td>
              <td className="px-6 py-4">
                {doc.category ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                    {doc.category}
                  </span>
                ) : '—'}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {doc.date ? formatDate(doc.date) : '—'}
              </td>
              <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                {doc.amount ? formatCurrency(doc.amount) : '—'}
              </td>
              <td className="px-6 py-4 text-center">
                {doc.processed ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                    ✓ Analysé
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700">
                    En cours
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
