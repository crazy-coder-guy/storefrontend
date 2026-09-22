import { Link } from 'react-router-dom'
import { HugeiconsIcon } from '@hugeicons/react'
import { Edit02Icon } from '@hugeicons/core-free-icons'
import { Table } from '../../components/Table'
import { SkeletonRows } from '../../components/Skeleton'
import { EmptyState } from '../../components/EmptyState'
import { ErrorState } from '../../components/ErrorState'
import { StockBadge } from '../../components/Badge'
import { stockStatus } from '../../utils/stockStatus'
import type { InventoryItem } from '../../types'

interface InventoryTableProps {
  items: InventoryItem[]
  threshold: number
  isLoading: boolean
  isError: boolean
  error: unknown
  onRetry: () => void
  onAdjust: (item: InventoryItem) => void
}

export function InventoryTable({
  items,
  threshold,
  isLoading,
  isError,
  error,
  onRetry,
  onAdjust,
}: InventoryTableProps) {
  return (
    <Table<InventoryItem>
      rowKey={(row) => row.id}
      data={items}
      isLoading={isLoading}
      loadingRows={<SkeletonRows cols={7} />}
      isError={isError}
      errorContent={<ErrorState error={error} onRetry={onRetry} />}
      emptyContent={
        <EmptyState title="No inventory found" description="Try adjusting your filters." />
      }
      columns={[
        { header: 'Product', key: 'product', render: (row) => row.product.name },
        { header: 'SKU', key: 'sku', render: (row) => row.sku },
        { header: 'Color', key: 'color', render: (row) => row.color?.name ?? '—' },
        { header: 'Size', key: 'size', render: (row) => row.size?.name ?? '—' },
        { header: 'Stock', key: 'stock', render: (row) => row.stockQuantity },
        {
          header: 'Status',
          key: 'status',
          render: (row) => <StockBadge status={stockStatus(row.stockQuantity, threshold)} />,
        },
        {
          header: '',
          key: 'actions',
          className: 'text-right',
          render: (row) => (
            <div className="flex justify-end gap-1">
              <button
                onClick={() => onAdjust(row)}
                className="rounded-lg p-1.5 text-black/60 hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/10"
                aria-label="Adjust stock"
                title="Adjust stock"
              >
                <HugeiconsIcon icon={Edit02Icon} size={16} />
              </button>
              <Link
                to={`/inventory/${row.id}/history`}
                className="rounded-lg px-2 py-1 text-xs text-black/60 hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/10"
              >
                History
              </Link>
            </div>
          ),
        },
      ]}
    />
  )
}
