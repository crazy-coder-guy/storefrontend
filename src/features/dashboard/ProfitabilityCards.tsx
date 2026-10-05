import { CoinsDollarIcon, Invoice01Icon, MoneyBag02Icon, PercentSquareIcon } from '@hugeicons/core-free-icons'
import { StatCard } from '../../components/StatCard'
import { formatCurrency } from '../../utils/formatCurrency'
import type { DashboardProfitability } from '../../types'

function formatPercent(value: number) {
  return `${(Number.isFinite(value) ? value : 0).toFixed(1)}%`
}

export function ProfitabilityCards({ data }: { data: DashboardProfitability }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Total Revenue" value={formatCurrency(data.totalRevenue)} icon={CoinsDollarIcon} hint={`${data.orderCount} orders`} />
      <StatCard
        label="Net Profit"
        value={
          <span className={data.netProfit < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
            {formatCurrency(data.netProfit)}
          </span>
        }
        icon={MoneyBag02Icon}
        hint="revenue minus every cost"
      />
      <StatCard label="Avg. Profit Margin" value={formatPercent(data.averageProfitMargin)} icon={PercentSquareIcon} />
      <StatCard
        label="Avg. Order Value"
        value={formatCurrency(data.averageOrderValue)}
        icon={Invoice01Icon}
        hint={`${formatCurrency(data.averageProfitPerOrder)} avg profit`}
      />
    </div>
  )
}
