'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface Company { id: string; name: string }

const months = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
]

export function ReportGenerator({ companies }: { companies: Company[] }) {
  const [selectedCompany, setSelectedCompany] = useState(companies[0]?.id || '')
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<string>('')

  async function generateReport() {
    if (!selectedCompany) return
    setLoading(true)
    setReport('')

    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyId: selectedCompany,
        month: selectedMonth + 1,
        year: selectedYear,
      }),
    })

    const data = await res.json()
    setReport(data.report)
    setLoading(false)
  }

  const years = [2023, 2024, 2025, 2026]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Générer un rapport mensuel</h2>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Société</label>
              <select
                value={selectedCompany}
                onChange={e => setSelectedCompany(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              >
                {companies.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Mois</label>
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(Number(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              >
                {months.map((m, i) => (
                  <option key={m} value={i}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Année</label>
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(Number(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <Button onClick={generateReport} loading={loading} disabled={!selectedCompany}>
              📑 Générer le rapport
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-r-transparent mb-4" />
            <p className="text-gray-600">L&apos;agent IA analyse vos données et génère votre rapport...</p>
          </CardContent>
        </Card>
      )}

      {report && !loading && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">
                Rapport {months[selectedMonth]} {selectedYear}
              </h2>
              <button
                onClick={() => {
                  const blob = new Blob([report], { type: 'text/plain' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `rapport-${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}.txt`
                  a.click()
                }}
                className="text-sm text-blue-600 hover:underline"
              >
                ⬇ Télécharger
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed bg-gray-50 rounded-xl p-6 border border-gray-100">
              {report}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
