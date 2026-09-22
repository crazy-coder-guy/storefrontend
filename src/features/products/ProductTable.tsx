import { HugeiconsIcon } from '@hugeicons/react'
import { Delete02Icon, Edit02Icon, Image02Icon, ViewIcon } from '@hugeicons/core-free-icons'
import { Table } from '../../components/Table'
import { SkeletonRows } from '../../components/Skeleton'
import { EmptyState } from '../../components/EmptyState'
import { ErrorState } from '../../components/ErrorState'
import { Badge, StatusBadge } from '../../components/Badge'
import { formatCurrency } from '../../utils/formatCurrency'
import type { Product } from '../../types'

interface ProductTableProps {
  products: Product[]
  isLoading: boolean
  isError: boolean
  error: unknown
  onRetry: () => void
  onDelete: (product: Product) => void
  onDeletePermanently: (product: Product) => void
  onViewProduct: (product: Product) => void
  onEditProduct?: (product: Product) => void
}

export function ProductTable({
  products,
  isLoading,
  isError,
  error,
  onRetry,
  onDelete,
  onDeletePermanently,
  onViewProduct,
  onEditProduct,
}: ProductTableProps) {
  return (
    <Table<Product>
      rowKey={(row) => row.id}
      data={products}
      isLoading={isLoading}
      loadingRows={<SkeletonRows cols={9} />}
      isError={isError}
      errorContent={<ErrorState error={error} onRetry={onRetry} />}
      emptyContent={
        <EmptyState title="No products yet" description="Add your first product to get started." />
      }
      columns={[
        {
          header: '',
          key: 'image',
          className: 'w-16',
          render: (row) => {
            const image = row.images?.[0]
            return (
              <div className="h-10 w-10 overflow-hidden rounded-lg border border-black/10 bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.03]">
                {image ? (
                  <img src={image.imageUrl} alt={row.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-black/30 dark:text-white/30">
                    <HugeiconsIcon icon={Image02Icon} size={18} />
                  </div>
                )}
              </div>
            )
          },
        },
        {
          header: 'Name',
          key: 'name',
          render: (row) => (
            <button
              type="button"
              onClick={() => onViewProduct(row)}
              className="text-left font-medium hover:underline cursor-pointer"
            >
              {row.name}
            </button>
          ),
        },
        {
          header: 'Category',
          key: 'category',
          render: (row) => row.category?.name ?? <span className="text-black/30 dark:text-white/30">—</span>,
        },
        { header: 'Type', key: 'type', render: (row) => row.productType },
        {
          header: 'Sizes',
          key: 'sizes',
          render: (row) =>
            row.sizes && row.sizes.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {row.sizes.map((size) => (
                  <Badge key={size.id} className="px-2 py-0 text-[11px]">
                    {size.code}
                  </Badge>
                ))}
              </div>
            ) : (
              <span className="text-black/30 dark:text-white/30">—</span>
            ),
        },
        { header: 'Base Price', key: 'basePrice', render: (row) => formatCurrency(row.basePrice) },
        { header: 'MRP', key: 'mrp', render: (row) => formatCurrency(row.mrp) },
        { header: 'Status', key: 'status', render: (row) => <StatusBadge status={row.status} /> },
        {
          header: 'Actions',
          key: 'actions',
          className: 'text-right',
          render: (row) => (
            <div className="flex items-center justify-end gap-1.5">
              <button
                type="button"
                onClick={() => onViewProduct(row)}
                className="inline-flex items-center gap-1 rounded-md border border-black/10 bg-white px-2.5 py-1 text-xs font-medium text-black/80 hover:bg-black/5 hover:text-black cursor-pointer shadow-2xs dark:border-white/10 dark:bg-black dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white transition-colors"
              >
                <HugeiconsIcon icon={ViewIcon} size={14} />
                <span>View</span>
              </button>
              <button
                type="button"
                onClick={() => onEditProduct?.(row)}
                className="inline-flex items-center gap-1 rounded-md border border-black/10 bg-white px-2.5 py-1 text-xs font-medium text-black/80 hover:bg-black/5 hover:text-black shadow-2xs cursor-pointer dark:border-white/10 dark:bg-black dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white transition-colors"
              >
                <HugeiconsIcon icon={Edit02Icon} size={14} />
                <span>Edit</span>
              </button>
              {row.status === 'INACTIVE' ? (
                <button
                  type="button"
                  onClick={() => onDeletePermanently(row)}
                  className="inline-flex items-center gap-1 rounded-md border border-red-600 bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700 hover:border-red-700 cursor-pointer dark:border-red-500 dark:bg-red-500 dark:hover:bg-red-600 transition-colors"
                  title="Delete product permanently"
                >
                  <HugeiconsIcon icon={Delete02Icon} size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onDelete(row)}
                  className="inline-flex items-center gap-1 rounded-md border border-red-200/50 bg-rose-50/50 px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-100/70 cursor-pointer dark:border-red-900/40 dark:bg-rose-950/20 dark:text-rose-400 dark:hover:bg-rose-900/30 transition-colors"
                  title="Deactivate product"
                >
                  <HugeiconsIcon icon={Delete02Icon} size={14} />
                </button>
              )}
            </div>
          ),
        },
      ]}
    />
  )
}

