'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Company { id: string; name: string }

interface Props {
  companies: Company[]
  onAdded: () => void
}

const PCG_CATEGORIES = [
  { label: 'Ventes / Revenus (70x)', value: 'Ventes', type: 'credit', pcg: '706000' },
  { label: 'Achats marchandises (60x)', value: 'Achats', type: 'debit', pcg: '607000' },
  { label: 'Services extérieurs (61x)', value: 'Services', type: 'debit', pcg: '611000' },
  { label: 'Publicité / Communication (62x)', value: 'Publicité', type: 'debit', pcg: '623000' },
  { label: 'Impôts et taxes (63x)', value: 'Impôts', type: 'debit', pcg: '635000' },
  { label: 'Charges de personnel (64x)', value: 'Personnel', type: 'debit', pcg: '641000' },
  { label: 'Autres charges (65x)', value: 'Autres charges', type: 'debit', pcg: '658000' },
  { label: 'Frais bancaires (62700)', value: 'Frais bancaires', type: 'debit', pcg: '627000' },
  { label: 'Loyer (61300)', value: 'Loyer', type: 'debit', pcg: '613000' },
]

export function AddTransactionForm({ companies, onAdded }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    company_id: companies[0]?.id || '',
    label: '',
    amount: '',
    category_index: '0',
    date: new Date().toISOString().split('T')[0],
    tva_rate: '21',
  })

  const selected = PCG_CATEGORIES[parseInt(form.category_index)]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()

    const amountHT = parseFloat(form.amount)
    const tvaRate = parseFloat(form.tva_rate) / 100
    const amountTVA = parseFloat((amountHT * tvaRate).toFixed(2))

    await supabase.from('transactions').insert({
      company_id: form.company_id,
      label: form.label,
      amount: amountHT,
      type: selected.type,
      category: selected.value,
      pcg_account: selected.pcg,
      tva_rate: parseFloat(form.tva_rate),
      tva_amount: amountTVA,
      date: form.date,
    })

    setLoading(false)
    setOpen(false)
    setForm(f => ({ ...f, label: '', amount: '' }))
    onAdded()
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        + Ajouter une transaction
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Nouvelle transaction</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {companies.length > 1 && (
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Société</label>
              <select
                value={form.company_id}
                onChange={e => setForm(f => ({ ...f, company_id: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {companies.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Libellé</label>
            <Input
              required
              value={form.label}
              onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
              placeholder="Ex: Facture client ABC, Loyer bureau..."
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Catégorie PCG</label>
            <select
              value={form.category_index}
              onChange={e => setForm(f => ({ ...f, category_index: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PCG_CATEGORIES.map((cat, i) => (
                <option key={i} value={i}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Montant HT (€)</label>
              <Input
                required
                type="number"
                step="0.01"
                min="0"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Taux TVA (%)</label>
              <select
                value={form.tva_rate}
                onChange={e => setForm(f => ({ ...f, tva_rate: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="21">21% (taux normal)</option>
                <option value="12">12% (taux réduit)</option>
                <option value="6">6% (taux réduit)</option>
                <option value="0">0% (exonéré / intracommunautaire)</option>
              </select>
            </div>
          </div>

          {form.amount && (
            <div className="bg-blue-50 rounded-lg p-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Montant HT</span>
                <span>{parseFloat(form.amount || '0').toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>TVA ({form.tva_rate}%)</span>
                <span>{(parseFloat(form.amount || '0') * parseFloat(form.tva_rate) / 100).toFixed(2)} €</span>
              </div>
              <div className="flex justify-between font-semibold text-gray-900 border-t border-blue-200 mt-2 pt-2">
                <span>Total TTC</span>
                <span>{(parseFloat(form.amount || '0') * (1 + parseFloat(form.tva_rate) / 100)).toFixed(2)} €</span>
              </div>
              <div className="text-xs text-blue-600 mt-1">Compte PCG : {selected.pcg} — {selected.type === 'credit' ? 'Crédit' : 'Débit'}</div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Date</label>
            <Input
              required
              type="date"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
