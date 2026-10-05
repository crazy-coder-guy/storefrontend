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
      <StatCard label="Net Profit" value={formatCurrency(data.netProfit)} icon={MoneyBag02Icon} hint="revenue minus all costs" />
      <StatCard label="Avg. Order Value" value={formatCurrency(data.averageOrderValue)} icon={Invoice01Icon} />
      <StatCard label="Avg. Profit / Order" value={formatCurrency(data.averageProfitPerOrder)} icon={ChartUpIcon} />
      <StatCard label="Avg. Profit Margin" value={formatPercent(data.averageProfitMargin)} icon={PercentSquareIcon} />
      <StatCard label="Product Cost" value={formatCurrency(data.totalProductCost)} icon={PackageIcon} />
      <StatCard label="Courier Cost" value={formatCurrency(data.totalCourierCost)} icon={DeliveryTruck01Icon} />
      <StatCard label="Packaging Cost" value={formatCurrency(data.totalPackagingCost)} icon={ChartAverageIcon} />
      <StatCard label="Payment Gateway Fees" value={formatCurrency(data.totalPaymentGatewayFees)} icon={CreditCardIcon} />
      <StatCard label="Marketing Spend" value={formatCurrency(data.totalMarketingSpend)} icon={Megaphone01Icon} />
      <StatCard label="Exchange / Return Cost" value={formatCurrency(data.totalExchangeCost)} icon={MoneyExchange01Icon} />
      <StatCard label="Misc. Cost" value={formatCurrency(data.totalMiscCost)} icon={CoinsDollarIcon} />
    </div>
  )
}
