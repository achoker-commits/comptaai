'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

interface MonthlyData {
  month: string
  recettes: number
  depenses: number
}

interface CategoryData {
  name: string
  value: number
}

interface Props {
  monthlyData: MonthlyData[]
  categoryData: CategoryData[]
}

const PIE_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#f97316']

function formatEuro(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k€`
  return `${value.toFixed(0)}€`
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; fill: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-900 mb-1">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: p.fill }} />
          <span className="text-gray-600">{p.name} :</span>
          <span className="font-medium text-gray-900">{p.value.toFixed(2)} €</span>
        </div>
      ))}
    </div>
  )
}

export function RevenueChart({ monthlyData, categoryData }: Props) {
  const hasData = monthlyData.some(d => d.recettes > 0 || d.depenses > 0)
  const hasCatData = categoryData.some(d => d.value > 0)

  return (
    <div className="grid md:grid-cols-2 gap-6 mt-6">
      {/* Bar Chart — Recettes vs Dépenses */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4 text-sm">Recettes vs Dépenses (6 mois)</h3>
        {hasData ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} barSize={14} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={formatEuro} tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} width={48} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="recettes" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Recettes" />
              <Bar dataKey="depenses" fill="#ef4444" radius={[4, 4, 0, 0]} name="Dépenses" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">
            Aucune donnée disponible
          </div>
        )}
        <div className="flex gap-4 mt-3 justify-center">
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" /> Recettes
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-3 h-3 rounded-sm bg-red-400 inline-block" /> Dépenses
          </span>
        </div>
      </div>

      {/* Pie Chart — Dépenses par catégorie */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4 text-sm">Dépenses par catégorie</h3>
        {hasCatData ? (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${Number(value).toFixed(2)} €`, '']} />
              <Legend
                formatter={(value) => <span style={{ fontSize: 11, color: '#6b7280' }}>{value}</span>}
                iconType="circle"
                iconSize={8}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">
            Aucune dépense enregistrée
          </div>
        )}
      </div>
    </div>
  )
}
