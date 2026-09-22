import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { Table } from '../components/Table'
import { SkeletonRows } from '../components/Skeleton'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { Pagination } from '../components/Pagination'
import { formatDate } from '../utils/formatDate'
import { useVariantHistory } from '../features/inventory/hooks/useInventory'
import type { InventoryTransaction } from '../types'

export function InventoryHistoryPage() {
  const { variantId = '' } = useParams()
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, error, refetch } = useVariantHistory(variantId, page, 15)

  return (
    <div>
      <PageHeader
        title="Inventory History"
        breadcrumbs={[{ label: 'Inventory', to: '/inventory' }, { label: 'History' }]}
        description={`Transaction history for variant ${variantId}`}
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
          { header: 'Type', key: 'type', render: (row) => row.transactionType },
          { header: 'Quantity', key: 'quantity', render: (row) => row.quantity },
          {
            header: 'Change',
            key: 'change',
            render: (row) => `${row.previousStock} → ${row.newStock}`,
          },
          { header: 'Reason', key: 'reason', render: (row) => row.reason ?? '—' },
          { header: 'When', key: 'when', render: (row) => formatDate(row.createdAt) },
        ]}
      />

      {data && <Pagination meta={data.meta} onPageChange={setPage} />}
    </div>
  )
}
