import { Link } from 'react-router-dom'
import { HugeiconsIcon } from '@hugeicons/react'
import { Edit02Icon } from '@hugeicons/core-free-icons'
import { Table } from '../../components/Table'
import { SkeletonRows } from '../../components/Skeleton'
import { EmptyState } from '../../components/EmptyState'
import { ErrorState } from '../../components/ErrorState'
import { StockBadge } from '../../components/Badge'
import { ColorSwatch } from '../../components/ColorSwatch'
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
        {
          header: 'Product',
          key: 'product',
          className: 'min-w-[180px]',
          render: (row) => (
            <Link
              to={`/products?selectedProduct=${row.productId}`}
              className="font-medium text-black hover:underline dark:text-white"
            >
              {row.product.name}
            </Link>
          ),
        },
        { header: 'SKU', key: 'sku', className: 'min-w-[120px]', render: (row) => row.sku },
        {
          header: 'Color',
          key: 'color',
          className: 'min-w-[120px]',
          render: (row) => <ColorSwatch hexCode={row.color?.hexCode} name={row.color?.name} />,
        },
        { header: 'Size', key: 'size', className: 'min-w-[90px]', render: (row) => row.size?.code ?? '—' },
        { header: 'Stock', key: 'stock', className: 'min-w-[90px]', render: (row) => row.stockQuantity },
        {
          header: 'Status',
          key: 'status',
          className: 'min-w-[120px]',
          render: (row) => <StockBadge status={stockStatus(row.stockQuantity, threshold)} />,
        },
        {
          header: 'Actions',
          key: 'actions',
          className: 'min-w-[160px] text-right',
          render: (row) => (
            <div className="flex items-center justify-end gap-1.5">
              <button
                type="button"
                onClick={() => onAdjust(row)}
                className="inline-flex items-center gap-1 rounded-md border border-black/10 bg-white px-2.5 py-1 text-xs font-medium text-black/80 hover:bg-black/5 hover:text-black shadow-2xs cursor-pointer dark:border-white/10 dark:bg-black dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white transition-colors"
                title="Adjust stock"
              >
                <HugeiconsIcon icon={Edit02Icon} size={14} />
                <span>Adjust</span>
              </button>
              <Link
                to={`/inventory/${row.id}/history`}
                className="inline-flex items-center gap-1 rounded-md border border-black/10 bg-white px-2.5 py-1 text-xs font-medium text-black/80 hover:bg-black/5 hover:text-black shadow-2xs dark:border-white/10 dark:bg-black dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white transition-colors"
              >
                <span>History</span>
              </Link>
            </div>
          ),
        },
      ]}
    />
  )
}
