import { HugeiconsIcon } from '@hugeicons/react'
import { Delete02Icon, Edit02Icon } from '@hugeicons/core-free-icons'
import { Table } from '../../components/Table'
import { SkeletonRows } from '../../components/Skeleton'
import { EmptyState } from '../../components/EmptyState'
import { ErrorState } from '../../components/ErrorState'
import { StatusBadge } from '../../components/Badge'
import { formatDate } from '../../utils/formatDate'
import type { Category } from '../../types'

interface CategoryTableProps {
  categories: Category[]
  isLoading: boolean
  isError: boolean
  error: unknown
  onRetry: () => void
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
  onDeletePermanently: (category: Category) => void
}

export function CategoryTable({
  categories,
  isLoading,
  isError,
  error,
  onRetry,
  onEdit,
  onDelete,
  onDeletePermanently,
}: CategoryTableProps) {
  return (
    <Table<Category>
      rowKey={(row) => row.id}
      data={categories}
      isLoading={isLoading}
      loadingRows={<SkeletonRows cols={6} />}
      isError={isError}
      errorContent={<ErrorState error={error} onRetry={onRetry} />}
      emptyContent={
        <EmptyState title="No categories yet" description="Add your first category to get started." />
      }
      columns={[
        { header: 'Name', key: 'name', render: (row) => <span className="font-medium">{row.name}</span> },
        { header: 'Slug', key: 'slug', render: (row) => row.slug },
        { header: 'Products', key: 'productCount', render: (row) => row.productCount ?? 0 },
        { header: 'Status', key: 'status', render: (row) => <StatusBadge status={row.status} /> },
        { header: 'Updated', key: 'updated', render: (row) => formatDate(row.updatedAt) },
        {
          header: 'Actions',
          key: 'actions',
          className: 'text-right',
          render: (row) => {
            const hasProducts = (row.productCount ?? 0) > 0
            return (
              <div className="flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => onEdit(row)}
                  className="inline-flex items-center gap-1 rounded-md border border-black/10 bg-white px-2.5 py-1 text-xs font-medium text-black/80 hover:bg-black/5 hover:text-black shadow-2xs cursor-pointer dark:border-white/10 dark:bg-black dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white transition-colors"
                >
                  <HugeiconsIcon icon={Edit02Icon} size={14} />
                  <span>Edit</span>
                </button>
                {row.status === 'INACTIVE' ? (
                  <button
                    type="button"
                    onClick={() => onDeletePermanently(row)}
                    disabled={hasProducts}
                    className="inline-flex items-center gap-1 rounded-md border border-red-600 bg-red-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-700 hover:border-red-700 disabled:opacity-40 disabled:hover:bg-red-600 cursor-pointer dark:border-red-500 dark:bg-red-500 dark:hover:bg-red-600 transition-colors"
                    title={
                      hasProducts
                        ? `Move or delete ${row.productCount} product(s) out of this category first`
                        : 'Delete category permanently'
                    }
                  >
                    <HugeiconsIcon icon={Delete02Icon} size={14} />
                    <span>Delete</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onDelete(row)}
                    className="inline-flex items-center gap-1 rounded-md border border-red-200/50 bg-rose-50/50 px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-100/70 cursor-pointer dark:border-red-900/40 dark:bg-rose-950/20 dark:text-rose-400 dark:hover:bg-rose-900/30 transition-colors"
                    title="Deactivate category"
                  >
                    <HugeiconsIcon icon={Delete02Icon} size={14} />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            )
          },
        },
      ]}
    />
  )
}
