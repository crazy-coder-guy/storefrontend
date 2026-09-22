import { PageHeader } from '../components/PageHeader'
import { Skeleton } from '../components/Skeleton'
import { ErrorState } from '../components/ErrorState'
import { StatCards } from '../features/dashboard/StatCards'
import { LowStockTable } from '../features/dashboard/LowStockTable'
import { useDashboardSummary } from '../features/dashboard/hooks/useDashboardSummary'

export function DashboardPage() {
  const { data, isLoading, isError, error, refetch } = useDashboardSummary()

  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of your store's catalog and inventory." />

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      )}

      {isError && <ErrorState error={error} onRetry={() => refetch()} />}

      {data && (
        <div className="flex flex-col gap-8">
          <StatCards summary={data} />

          <section>
            <h2 className="mb-3 text-sm font-semibold text-black/70 dark:text-white/70">
              Low Stock Variants
            </h2>
            <LowStockTable items={data.lowStockProducts} />
          </section>
        </div>
      )}
    </div>
  )
}
