import { useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useTheme } from '../../context/ThemeContext'
import { formatCurrency } from '../../utils/formatCurrency'
import { useProfitabilityTimeseries } from './hooks/useDashboardProfitability'
import type { ProfitabilityDayPoint } from '../../types'

const RANGES = [
  { label: '7 Days', days: 7 as const },
  { label: '15 Days', days: 15 as const },
  { label: '1 Month', days: 30 as const },
]

// Categorical slots 1 (blue) and 2 (orange) — validated as an adjacent-safe
// pair (CVD Delta-E 9.1 light / 8.4 dark), each stepped for the chart surface.
const COLORS = {
  light: { grid: '#e5e4df', axis: '#86847c', revenue: '#2a78d6', netProfit: '#eb6834' },
  dark: { grid: '#2c2c2a', axis: '#8f8d84', revenue: '#3987e5', netProfit: '#d95926' },
}

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

interface MoneyTooltipProps {
  active?: boolean
  label?: string
  payload?: { color: string; value: number; name: string }[]
}

function MoneyTooltip({ active, label, payload }: MoneyTooltipProps) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="rounded-lg border border-black/10 bg-white px-3 py-2 text-xs shadow-lg dark:border-white/10 dark:bg-black">
      <p className="mb-1.5 font-medium text-black/60 dark:text-white/60">{label ? formatDateLabel(label) : ''}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 py-0.5">
          <span className="h-0.5 w-3 shrink-0 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="font-semibold text-black dark:text-white">{formatCurrency(entry.value)}</span>
          <span className="text-black/50 dark:text-white/50">{entry.name}</span>
        </div>
      ))}
    </div>
  )
}

function OrdersTooltip({ active, label, payload }: MoneyTooltipProps) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="rounded-lg border border-black/10 bg-white px-3 py-2 text-xs shadow-lg dark:border-white/10 dark:bg-black">
      <p className="mb-1 font-medium text-black/60 dark:text-white/60">{label ? formatDateLabel(label) : ''}</p>
      <p className="font-semibold text-black dark:text-white">
        {payload[0].value} order{payload[0].value === 1 ? '' : 's'}
      </p>
    </div>
  )
}

export function ProfitabilityCharts() {
  const [days, setDays] = useState<7 | 15 | 30>(7)
  const { theme } = useTheme()
  const colors = COLORS[theme]
  const { data, isFetching } = useProfitabilityTimeseries(days)
  const series: ProfitabilityDayPoint[] = data?.series ?? []

  return (
    <div className="space-y-4">
      {/* Date-range filter — one row, above both charts, scopes both at once */}
      <div className="flex items-center gap-1 self-start rounded-lg border border-black/10 bg-white p-1 dark:border-white/10 dark:bg-black">
        {RANGES.map((range) => (
          <button
            key={range.days}
            type="button"
            onClick={() => setDays(range.days)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              days === range.days
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'text-black/60 hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/10'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>

      <div
        className="grid grid-cols-1 gap-4 lg:grid-cols-3 transition-opacity duration-200"
        style={{ opacity: isFetching ? 0.6 : 1 }}
      >
        {/* Revenue & Net Profit — same unit (₹), one shared axis */}
        <div className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-black lg:col-span-2">
          <p className="mb-3 text-sm font-semibold text-black dark:text-white">Revenue &amp; Net Profit</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={colors.grid} strokeDasharray="0" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDateLabel}
                  tick={{ fill: colors.axis, fontSize: 11 }}
                  axisLine={{ stroke: colors.grid }}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => formatCurrency(v)}
                  tick={{ fill: colors.axis, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={70}
                />
                <Tooltip content={<MoneyTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 12 }}
                  formatter={(value) => <span className="text-black/70 dark:text-white/70">{value}</span>}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke={colors.revenue}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--chart-surface, #fff)' }}
                />
                <Line
                  type="monotone"
                  dataKey="netProfit"
                  name="Net Profit"
                  stroke={colors.netProfit}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--chart-surface, #fff)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders per day — different unit/scale from money, so its own chart/axis */}
        <div className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-black">
          <p className="mb-3 text-sm font-semibold text-black dark:text-white">Orders</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={colors.grid} strokeDasharray="0" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDateLabel}
                  tick={{ fill: colors.axis, fontSize: 11 }}
                  axisLine={{ stroke: colors.grid }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: colors.axis, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <Tooltip content={<OrdersTooltip />} cursor={{ fill: colors.grid, opacity: 0.5 }} />
                <Bar dataKey="orderCount" name="Orders" fill={colors.revenue} radius={[4, 4, 0, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
