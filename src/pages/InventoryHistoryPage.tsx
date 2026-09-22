import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { Table } from '../components/Table'
import { SkeletonRows } from '../components/Skeleton'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { Pagination } from '../components/Pagination'
import { Badge } from '../components/Badge'
import { formatDate } from '../utils/formatDate'
import { useVariantHistory } from '../features/inventory/hooks/useInventory'
import type { InventoryTransaction, InventoryTransactionType } from '../types'

const TRANSACTION_LABEL: Record<InventoryTransactionType, string> = {
  RESTOCK: 'Restock',
  MANUAL_INCREASE: 'Manual Increase',
  MANUAL_DECREASE: 'Manual Decrease',
  ADJUSTMENT: 'Adjustment',
}

export function InventoryHistoryPage() {
  const { variantId = '' } = useParams()
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, error, refetch } = useVariantHistory(variantId, page, 15)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory History"
        breadcrumbs={[{ label: 'Inventory', to: '/inventory' }, { label: 'History' }]}
        description={`Audit log for variant #${variantId.slice(0, 8)}`}
      />

      <Table<InventoryTransaction>
        rowKey={(row) => row.id}
        data={data?.items ?? []}
        isLoading={isLoading}
        loadingRows={<SkeletonRows cols={5} />}
        isError={isError}
        errorContent={<ErrorState error={error} onRetry={() => refetch()} />}
        emptyContent={<EmptyState title="No history yet" description="Stock adjustments will show up here." />}
        columns={[
          {
            header: 'Type',
            key: 'type',
            className: 'w-44 whitespace-nowrap',
            render: (row) => (
              <Badge className="bg-black/5 text-black border-black/10 dark:bg-white/10 dark:text-white dark:border-white/15">
                {TRANSACTION_LABEL[row.transactionType] ?? row.transactionType}
              </Badge>
            ),
          },
          {
            header: 'Quantity',
            key: 'quantity',
            className: 'w-28 whitespace-nowrap font-semibold text-black dark:text-white',
            render: (row) => (
              <span>
                {row.transactionType === 'MANUAL_DECREASE' ? `-${row.quantity}` : `+${row.quantity}`}
              </span>
            ),
          },
          {
            header: 'Stock Change',
            key: 'change',
            className: 'w-36 whitespace-nowrap text-black/80 dark:text-white/80 font-mono text-sm',
            render: (row) => (
              <span className="inline-flex items-center gap-1.5">
                <span>{row.previousStock}</span>
                <span className="text-black/40 dark:text-white/40">→</span>
                <span className="font-bold text-black dark:text-white">{row.newStock}</span>
              </span>
            ),
          },
          {
            header: 'Reason',
            key: 'reason',
            className: 'max-w-xl break-words text-sm leading-relaxed text-black/90 dark:text-white/90 font-medium',
            render: (row) => <span className="line-clamp-2">{row.reason || '—'}</span>,
          },
          {
            header: 'Date & Time',
            key: 'when',
            className: 'w-44 whitespace-nowrap text-sm text-black/60 dark:text-white/60 text-right',
            render: (row) => formatDate(row.createdAt),
          },
        ]}
      />

      {data && <Pagination meta={data.meta} onPageChange={setPage} />}
    </div>
  )
}


