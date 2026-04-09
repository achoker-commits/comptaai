'use client'

import { useState, useMemo } from 'react'
import { formatCurrency } from '@/lib/utils'

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
  transactions: Transaction[]
  companies: Company[]
}

// Comptes PCG déductibles pour TVA (charges)
const PCG_DEDUCTIBLE = ['60', '61', '62', '63', '64', '65']

function isDeductible(pcg?: string) {
  if (!pcg) return true // On suppose déductible si pas de compte
  return PCG_DEDUCTIBLE.some(prefix => pcg.startsWith(prefix))
}

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

const QUARTERS = [
  { label: 'T1 — Jan→Mar', months: [0, 1, 2] },
  { label: 'T2 — Avr→Jun', months: [3, 4, 5] },
  { label: 'T3 — Juil→Sep', months: [6, 7, 8] },
  { label: 'T4 — Oct→Déc', months: [9, 10, 11] },
]

export function TvaCalculator({ transactions, companies }: Props) {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()

  const [mode, setMode] = useState<'monthly' | 'quarterly'>('monthly')
  const [year, setYear] = useState(currentYear)
  const [month, setMonth] = useState(currentMonth)
  const [quarter, setQuarter] = useState(Math.floor(currentMonth / 3))
  const [companyId, setCompanyId] = useState<string>('all')

  const filteredByCompany = useMemo(
    () => companyId === 'all' ? transactions : transactions.filter(t => (t as unknown as { company_id: string }).company_id === companyId),
    [transactions, companyId]
  )

  const periodTransactions = useMemo(() => {
    return filteredByCompany.filter(t => {
      const d = new Date(t.date)
      if (d.getFullYear() !== year) return false
      if (mode === 'monthly') return d.getMonth() === month
      return QUARTERS[quarter].months.includes(d.getMonth())
    })
  }, [filteredByCompany, year, month, quarter, mode])

  const revenues = periodTransactions.filter(t => t.type === 'credit')
  const expenses = periodTransactions.filter(t => t.type === 'debit' && isDeductible(t.pcg_account))

  const tvaCollectee = revenues.reduce((sum, t) => {
    const rate = t.tva_rate ?? 21
    return sum + (t.tva_amount ?? t.amount * rate / 100)
  }, 0)

  const tvaDeductible = expenses.reduce((sum, t) => {
    const rate = t.tva_rate ?? 21
    return sum + (t.tva_amount ?? t.amount * rate / 100)
  }, 0)

  const tvaNet = tvaCollectee - tvaDeductible
  const caHT = revenues.reduce((s, t) => s + t.amount, 0)
  const chargesHT = expenses.reduce((s, t) => s + t.amount, 0)

  const periodLabel = mode === 'monthly'
    ? `${MONTHS[month]} ${year}`
    : `${QUARTERS[quarter].label} ${year}`

  // Détail par taux
  const rateBreakdown = (txs: Transaction[], label: string) => {
    const byRate: Record<number, { base: number; tva: number }> = {}
    txs.forEach(t => {
      const rate = t.tva_rate ?? 21
      if (!byRate[rate]) byRate[rate] = { base: 0, tva: 0 }
      byRate[rate].base += t.amount
      byRate[rate].tva += (t.tva_amount ?? t.amount * rate / 100)
    })
    return Object.entries(byRate).map(([rate, v]) => ({ rate: parseFloat(rate), ...v, label }))
  }

  const collecteeBreakdown = rateBreakdown(revenues, 'Collectée')
  const deductibleBreakdown = rateBreakdown(expenses, 'Déductible')

  return (
    <div>
      {/* Filtres */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          {companies.length > 1 && (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Société</label>
              <select
                value={companyId}
                onChange={e => setCompanyId(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Toutes</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Année</label>
            <select
              value={year}
              onChange={e => setYear(parseInt(e.target.value))}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[currentYear - 1, currentYear, currentYear + 1].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Période</label>
            <div className="flex gap-2">
              <button
                onClick={() => setMode('monthly')}
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${mode === 'monthly' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                Mensuel
              </button>
              <button
                onClick={() => setMode('quarterly')}
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${mode === 'quarterly' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                Trimestriel
              </button>
            </div>
          </div>

          {mode === 'monthly' ? (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Mois</label>
              <select
                value={month}
                onChange={e => setMonth(parseInt(e.target.value))}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
            </div>
          ) : (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Trimestre</label>
              <select
                value={quarter}
                onChange={e => setQuarter(parseInt(e.target.value))}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {QUARTERS.map((q, i) => <option key={i} value={i}>{q.label}</option>)}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* KPIs TVA */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
          <p className="text-sm text-blue-700 font-medium">TVA Collectée</p>
          <p className="text-3xl font-bold text-blue-800 mt-2">{formatCurrency(tvaCollectee)}</p>
          <p className="text-xs text-blue-500 mt-1">Sur {formatCurrency(caHT)} de CA HT</p>
        </div>
        <div className="bg-green-50 rounded-xl p-5 border border-green-100">
          <p className="text-sm text-green-700 font-medium">TVA Déductible</p>
          <p className="text-3xl font-bold text-green-800 mt-2">{formatCurrency(tvaDeductible)}</p>
          <p className="text-xs text-green-500 mt-1">Sur {formatCurrency(chargesHT)} de charges HT</p>
        </div>
        <div className={`rounded-xl p-5 border ${tvaNet >= 0 ? 'bg-orange-50 border-orange-100' : 'bg-purple-50 border-purple-100'}`}>
          <p className={`text-sm font-medium ${tvaNet >= 0 ? 'text-orange-700' : 'text-purple-700'}`}>
            {tvaNet >= 0 ? 'TVA à payer' : 'Crédit de TVA'}
          </p>
          <p className={`text-3xl font-bold mt-2 ${tvaNet >= 0 ? 'text-orange-800' : 'text-purple-800'}`}>
            {formatCurrency(Math.abs(tvaNet))}
          </p>
          <p className={`text-xs mt-1 ${tvaNet >= 0 ? 'text-orange-500' : 'text-purple-500'}`}>
            {tvaNet >= 0 ? 'À déclarer sur CA3' : 'Remboursement possible'}
          </p>
        </div>
      </div>

      {/* Tableau CA3 simplifié */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          Déclaration CA3 simulée — {periodLabel}
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-sm text-gray-600">Ligne 01 — CA imposable HT</span>
            <span className="text-sm font-semibold text-gray-900">{formatCurrency(caHT)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-sm text-gray-600">Ligne 08 — TVA collectée brute</span>
            <span className="text-sm font-semibold text-blue-700">{formatCurrency(tvaCollectee)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-sm text-gray-600">Ligne 20 — TVA déductible sur achats</span>
            <span className="text-sm font-semibold text-green-700">{formatCurrency(tvaDeductible)}</span>
          </div>
          <div className="flex justify-between py-3 bg-gray-50 px-3 rounded-lg mt-2">
            <span className="text-sm font-bold text-gray-900">
              {tvaNet >= 0 ? 'Ligne 57 — TVA à payer' : 'Crédit de TVA'}
            </span>
            <span className={`text-sm font-bold ${tvaNet >= 0 ? 'text-orange-600' : 'text-purple-600'}`}>
              {formatCurrency(Math.abs(tvaNet))}
            </span>
          </div>
        </div>
      </div>

      {/* Détail par taux */}
      {(collecteeBreakdown.length > 0 || deductibleBreakdown.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          {collecteeBreakdown.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h4 className="font-semibold text-gray-900 mb-3 text-sm">TVA collectée par taux</h4>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500">
                    <th className="pb-2">Taux</th>
                    <th className="pb-2 text-right">Base HT</th>
                    <th className="pb-2 text-right">TVA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {collecteeBreakdown.map(r => (
                    <tr key={r.rate}>
                      <td className="py-2">{r.rate}%</td>
                      <td className="py-2 text-right text-gray-600">{formatCurrency(r.base)}</td>
                      <td className="py-2 text-right font-medium text-blue-700">{formatCurrency(r.tva)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {deductibleBreakdown.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h4 className="font-semibold text-gray-900 mb-3 text-sm">TVA déductible par taux</h4>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500">
                    <th className="pb-2">Taux</th>
                    <th className="pb-2 text-right">Base HT</th>
                    <th className="pb-2 text-right">TVA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {deductibleBreakdown.map(r => (
                    <tr key={r.rate}>
                      <td className="py-2">{r.rate}%</td>
                      <td className="py-2 text-right text-gray-600">{formatCurrency(r.base)}</td>
                      <td className="py-2 text-right font-medium text-green-700">{formatCurrency(r.tva)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {periodTransactions.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100 mt-4">
          <p className="text-3xl mb-3">📋</p>
          <p className="text-gray-500 text-sm">Aucune transaction pour {periodLabel}</p>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-6 text-center">
        ⚠️ Ces calculs sont indicatifs. Faites valider votre déclaration par un expert-comptable certifié.
      </p>
    </div>
  )
}
