import { Link } from 'react-router-dom'
import { HugeiconsIcon } from '@hugeicons/react'
import { Delete02Icon, Edit02Icon, ViewIcon } from '@hugeicons/core-free-icons'
import { Table } from '../../components/Table'
import { SkeletonRows } from '../../components/Skeleton'
import { EmptyState } from '../../components/EmptyState'
import { ErrorState } from '../../components/ErrorState'
import { StatusBadge } from '../../components/Badge'
import { formatCurrency } from '../../utils/formatCurrency'
import type { Product } from '../../types'

interface ProductTableProps {
  products: Product[]
  isLoading: boolean
  isError: boolean
  error: unknown
  onRetry: () => void
  onDelete: (product: Product) => void
}

export function ProductTable({ products, isLoading, isError, error, onRetry, onDelete }: ProductTableProps) {
  return (
    <Table<Product>
      rowKey={(row) => row.id}
      data={products}
      isLoading={isLoading}
      loadingRows={<SkeletonRows cols={6} />}
      isError={isError}
      errorContent={<ErrorState error={error} onRetry={onRetry} />}
      emptyContent={
        <EmptyState title="No products yet" description="Add your first product to get started." />
      }
      columns={[
        {
          header: 'Name',
          key: 'name',
          render: (row) => (
            <Link to={`/products/${row.id}`} className="font-medium hover:underline">
              {row.name}
            </Link>
          ),
        },
        { header: 'Type', key: 'type', render: (row) => row.productType },
        { header: 'Base Price', key: 'basePrice', render: (row) => formatCurrency(row.basePrice) },
        { header: 'MRP', key: 'mrp', render: (row) => formatCurrency(row.mrp) },
        { header: 'Status', key: 'status', render: (row) => <StatusBadge status={row.status} /> },
        {
          header: '',
          key: 'actions',
          className: 'text-right',
          render: (row) => (
            <div className="flex justify-end gap-1">
              <Link
                to={`/products/${row.id}`}
                className="rounded-lg p-1.5 text-black/60 hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/10"
                aria-label="View"
              >
                <HugeiconsIcon icon={ViewIcon} size={16} />
              </Link>
              <Link
                to={`/products/${row.id}/edit`}
                className="rounded-lg p-1.5 text-black/60 hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/10"
                aria-label="Edit"
              >
                <HugeiconsIcon icon={Edit02Icon} size={16} />
              </Link>
              <button
                onClick={() => onDelete(row)}
                disabled={row.status === 'INACTIVE'}
                className="rounded-lg p-1.5 text-black/60 hover:bg-black/5 disabled:opacity-30 dark:text-white/60 dark:hover:bg-white/10"
                aria-label="Deactivate"
              >
                <HugeiconsIcon icon={Delete02Icon} size={16} />
              </button>
            </div>
          ),
        },
      ]}
    />
  )
}
