'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function AddCompanyForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', siret: '', vat_number: '', address: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('companies').insert({
      user_id: user!.id,
      name: form.name,
      siret: form.siret || null,
      vat_number: form.vat_number || null,
      address: form.address || null,
    })

    setLoading(false)
    setOpen(false)
    setForm({ name: '', siret: '', vat_number: '', address: '' })
    router.refresh()
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        + Ajouter une société
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Nouvelle société</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="company-name"
            label="Nom de la société *"
            placeholder="Ma Société SARL"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            required
          />
          <Input
            id="siret"
            label="SIRET"
            placeholder="12345678901234"
            value={form.siret}
            onChange={e => setForm(f => ({ ...f, siret: e.target.value }))}
          />
          <Input
            id="vat"
            label="Numéro de TVA intracommunautaire"
            placeholder="FR12345678901"
            value={form.vat_number}
            onChange={e => setForm(f => ({ ...f, vat_number: e.target.value }))}
          />
          <Input
            id="address"
            label="Adresse"
            placeholder="1 rue de la Paix, 75001 Paris"
            value={form.address}
            onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
          />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" className="flex-1" loading={loading}>
              Créer la société
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
