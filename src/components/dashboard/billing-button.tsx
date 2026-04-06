'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function BillingButton() {
  const [loading, setLoading] = useState(false)

  async function openBillingPortal() {
    setLoading(true)
    const res = await fetch('/api/stripe/portal', { method: 'POST' })
    const { url } = await res.json()
    if (url) window.location.href = url
    setLoading(false)
  }

  return (
    <Button variant="outline" onClick={openBillingPortal} loading={loading}>
      Gérer mon abonnement
    </Button>
  )
}
