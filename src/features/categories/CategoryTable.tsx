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
}

export function CategoryTable({
  categories,
  isLoading,
  isError,
  error,
  onRetry,
  onEdit,
  onDelete,
}: CategoryTableProps) {
  return (
    <Table<Category>
      rowKey={(row) => row.id}
      data={categories}
      isLoading={isLoading}
      loadingRows={<SkeletonRows cols={5} />}
      isError={isError}
      errorContent={<ErrorState error={error} onRetry={onRetry} />}
      emptyContent={
        <EmptyState title="No categories yet" description="Add your first category to get started." />
      }
      columns={[
        { header: 'Name', key: 'name', render: (row) => <span className="font-medium">{row.name}</span> },
        { header: 'Slug', key: 'slug', render: (row) => row.slug },
        { header: 'Status', key: 'status', render: (row) => <StatusBadge status={row.status} /> },
        { header: 'Updated', key: 'updated', render: (row) => formatDate(row.updatedAt) },
        {
          header: '',
          key: 'actions',
          className: 'text-right',
          render: (row) => (
            <div className="flex justify-end gap-1">
              <button
                onClick={() => onEdit(row)}
                className="rounded-lg p-1.5 text-black/60 hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/10"
                aria-label="Edit"
              >
                <HugeiconsIcon icon={Edit02Icon} size={16} />
              </button>
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
