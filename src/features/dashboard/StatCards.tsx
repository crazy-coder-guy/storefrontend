import {
  Alert02Icon,
  CheckmarkSquare01Icon,
  PackageIcon,
  TShirtIcon,
} from '@hugeicons/core-free-icons'
import { StatCard } from '../../components/StatCard'
import type { DashboardSummary } from '../../types'

export function StatCards({ summary }: { summary: DashboardSummary }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total Products"
        value={summary.products.total}
        icon={TShirtIcon}
        hint={`${summary.products.active} active · ${summary.products.draft} draft · ${summary.products.inactive} inactive`}
      />
      <StatCard
        label="Total Stock"
        value={summary.inventory.totalStock}
        icon={PackageIcon}
        hint="units across all variants"
      />
      <StatCard
        label="Low / Out of Stock"
        value={`${summary.inventory.lowStock} / ${summary.inventory.outOfStock}`}
        icon={Alert02Icon}
        hint="low-stock / out-of-stock variants"
      />
      <StatCard
        label="Catalog"
        value={summary.catalog.categories}
        icon={CheckmarkSquare01Icon}
        hint={`${summary.catalog.sizes} sizes · ${summary.catalog.colors} colors`}
      />
    </div>
  )
}
