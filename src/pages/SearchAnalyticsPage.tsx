import { useMemo, useState } from 'react'
import { Search01Icon, AlertCircleIcon, ChartHistogramIcon } from '@hugeicons/core-free-icons'
import { PageHeader } from '../components/PageHeader'
import { Select } from '../components/Select'
import { StatCard } from '../components/StatCard'
import { Table } from '../components/Table'
import { SkeletonRows } from '../components/Skeleton'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { useTopSearches } from '../features/search/hooks/useTopSearches'
import { formatDate } from '../utils/formatDate'
import type { TopSearchTerm } from '../types'

export function SearchAnalyticsPage() {
  const [days, setDays] = useState(30)
  const { data, isLoading, isError, error, refetch } = useTopSearches({ days, limit: 100 })

  const terms = data ?? []

  const stats = useMemo(() => {
    const totalSearches = terms.reduce((sum, t) => sum + t.searchCount, 0)
    const zeroResultTerms = terms.filter((t) => t.avgResults === 0)
    return {
      totalSearches,
      uniqueTerms: terms.length,
      zeroResultCount: zeroResultTerms.length,
    }
  }, [terms])

  return (
    <div>
      <PageHeader
        title="Search Analytics"
        description="What customers are searching for on the storefront, and which searches return nothing."
        actions={
          <Select value={days} onChange={(e) => setDays(Number(e.target.value))} className="w-40">
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </Select>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Searches" value={stats.totalSearches} icon={Search01Icon} />
        <StatCard label="Unique Terms" value={stats.uniqueTerms} icon={ChartHistogramIcon} />
        <StatCard
          label="Zero-Result Terms"
          value={stats.zeroResultCount}
          icon={AlertCircleIcon}
          hint="Searches that found nothing — possible catalog gaps"
        />
      </div>

      {isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : (
        <Table<TopSearchTerm>
          rowKey={(row) => row.term}
          columns={[
            { key: 'term', header: 'Search term', render: (row) => <span className="font-medium">{row.term}</span> },
            { key: 'count', header: 'Times searched', render: (row) => row.searchCount },
            {
              key: 'avgResults',
              header: 'Avg. results',
              render: (row) =>
                row.avgResults === 0 ? (
                  <span className="inline-flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                    No results
                  </span>
                ) : (
                  Math.round(row.avgResults * 10) / 10
                ),
            },
            {
              key: 'lastSearchedAt',
              header: 'Last searched',
              render: (row) => formatDate(row.lastSearchedAt),
            },
          ]}
          data={terms}
          isLoading={isLoading}
          loadingRows={<SkeletonRows rows={8} cols={5} />}
          emptyContent={
            <EmptyState
              icon={Search01Icon}
              title="No searches yet"
              description="Once customers start searching on the storefront, the terms they use will show up here."
            />
          }
        />
      )}
    </div>
  )
}
