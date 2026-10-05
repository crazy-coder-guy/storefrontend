import {
  ChartAverageIcon,
  ChartUpIcon,
  CoinsDollarIcon,
  CreditCardIcon,
  DeliveryTruck01Icon,
  Invoice01Icon,
  Megaphone01Icon,
  MoneyBag02Icon,
  MoneyExchange01Icon,
  PackageIcon,
  PercentSquareIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { IconSvgElement } from '@hugeicons/react'
import { StatCard } from '../../components/StatCard'
import { formatCurrency } from '../../utils/formatCurrency'
import type { DashboardProfitability } from '../../types'

function formatPercent(value: number) {
  return `${(Number.isFinite(value) ? value : 0).toFixed(1)}%`
}

interface CostRow {
  label: string
  value: number
  icon: IconSvgElement
}

function CostBreakdownRow({ label, value, icon }: CostRow) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/5 text-black/50 dark:bg-white/10 dark:text-white/50">
          <HugeiconsIcon icon={icon} size={14} />
        </div>
        <span className="text-sm text-black/70 dark:text-white/70">{label}</span>
      </div>
      <span className="text-sm font-medium text-black dark:text-white">{formatCurrency(value)}</span>
    </div>
  )
}

export function ProfitabilityCards({ data }: { data: DashboardProfitability }) {
  const totalCosts =
    data.totalProductCost +
    data.totalCourierCost +
    data.totalPackagingCost +
    data.totalPaymentGatewayFees +
    data.totalMarketingSpend +
    data.totalExchangeCost +
    data.totalMiscCost

  return (
    <div className="space-y-4">
      {/* Headline numbers — the actual story: what came in, what's left over */}
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
          hint="revenue minus every cost below"
        />
        <StatCard label="Avg. Profit Margin" value={formatPercent(data.averageProfitMargin)} icon={PercentSquareIcon} />
        <StatCard label="Avg. Order Value" value={formatCurrency(data.averageOrderValue)} icon={Invoice01Icon} hint={`${formatCurrency(data.averageProfitPerOrder)} avg profit`} />
      </div>

      {/* Cost breakdown — supporting detail, visually secondary to the headline cards above */}
      <div className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-black">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-sm font-semibold text-black dark:text-white">Where the money went</p>
          <p className="text-xs text-black/40 dark:text-white/40">Total: {formatCurrency(totalCosts)}</p>
        </div>
        <div className="divide-y divide-black/5 dark:divide-white/10">
          <CostBreakdownRow label="Product Cost" value={data.totalProductCost} icon={PackageIcon} />
          <CostBreakdownRow label="Courier Cost" value={data.totalCourierCost} icon={DeliveryTruck01Icon} />
          <CostBreakdownRow label="Packaging Cost" value={data.totalPackagingCost} icon={ChartAverageIcon} />
          <CostBreakdownRow label="Payment Gateway Fees" value={data.totalPaymentGatewayFees} icon={CreditCardIcon} />
          <CostBreakdownRow label="Marketing Spend" value={data.totalMarketingSpend} icon={Megaphone01Icon} />
          <CostBreakdownRow label="Exchange / Return Cost" value={data.totalExchangeCost} icon={MoneyExchange01Icon} />
          <CostBreakdownRow label="Misc. Cost" value={data.totalMiscCost} icon={ChartUpIcon} />
        </div>
      </div>
    </div>
  )
}
