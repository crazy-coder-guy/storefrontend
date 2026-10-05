import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useTheme } from '../../context/ThemeContext'
import { formatCurrency } from '../../utils/formatCurrency'
import type { DashboardProfitability } from '../../types'

// Reuses the single-hue-per-single-series rule: cost is always this orange,
// matching "Net Profit" elsewhere on the dashboard (same entity, cost side).
const COLORS = {
  light: { grid: '#e5e4df', axis: '#86847c', cost: '#eb6834' },
  dark: { grid: '#2c2c2a', axis: '#8f8d84', cost: '#d95926' },
}

interface CostTooltipProps {
  active?: boolean
  payload?: { payload: { label: string; value: number } }[]
}

function CostTooltip({ active, payload }: CostTooltipProps) {
  if (!active || !payload || payload.length === 0) return null
  const point = payload[0].payload
  return (
    <div className="rounded-lg border border-black/10 bg-white px-3 py-2 text-xs shadow-lg dark:border-white/10 dark:bg-black">
      <p className="mb-1 font-medium text-black/60 dark:text-white/60">{point.label}</p>
      <p className="font-semibold text-black dark:text-white">{formatCurrency(point.value)}</p>
    </div>
  )
}

export function CostBreakdownChart({ data }: { data: DashboardProfitability }) {
  const { theme } = useTheme()
  const colors = COLORS[theme]

  const rows = [
    { label: 'Product Cost', value: data.totalProductCost },
    { label: 'Courier', value: data.totalCourierCost },
    { label: 'Packaging', value: data.totalPackagingCost },
    { label: 'Gateway Fees', value: data.totalPaymentGatewayFees },
    { label: 'Marketing', value: data.totalMarketingSpend },
    { label: 'Exchange/Return', value: data.totalExchangeCost },
    { label: 'Misc', value: data.totalMiscCost },
  ]
    .filter((row) => row.value > 0)
    .sort((a, b) => b.value - a.value)

  return (
    <div className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-black">
      <p className="mb-3 text-sm font-semibold text-black dark:text-white">Where the Money Went</p>
      <div className="h-64">
        {rows.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-black/40 dark:text-white/40">
            No cost data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={colors.grid} strokeDasharray="0" horizontal={false} />
              <XAxis
                type="number"
                tickFormatter={(v) => formatCurrency(v)}
                tick={{ fill: colors.axis, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="label"
                tick={{ fill: colors.axis, fontSize: 11 }}
                axisLine={{ stroke: colors.grid }}
                tickLine={false}
                width={100}
              />
              <Tooltip content={<CostTooltip />} cursor={{ fill: colors.grid, opacity: 0.5 }} />
              <Bar dataKey="value" fill={colors.cost} radius={[0, 4, 4, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
