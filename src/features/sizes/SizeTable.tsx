import { HugeiconsIcon } from '@hugeicons/react'
import { Delete02Icon, Edit02Icon } from '@hugeicons/core-free-icons'
import { Table } from '../../components/Table'
import { SkeletonRows } from '../../components/Skeleton'
import { EmptyState } from '../../components/EmptyState'
import { ErrorState } from '../../components/ErrorState'
import { StatusBadge } from '../../components/Badge'
import type { Size } from '../../types'

interface SizeTableProps {
  sizes: Size[]
  isLoading: boolean
  isError: boolean
  error: unknown
  onRetry: () => void
  onEdit: (size: Size) => void
  onDelete: (size: Size) => void
}

export function SizeTable({ sizes, isLoading, isError, error, onRetry, onEdit, onDelete }: SizeTableProps) {
  return (
    <Table<Size>
      rowKey={(row) => row.id}
      data={sizes}
      isLoading={isLoading}
      loadingRows={<SkeletonRows cols={5} />}
      isError={isError}
      errorContent={<ErrorState error={error} onRetry={onRetry} />}
      emptyContent={<EmptyState title="No sizes yet" description="Add your first size to get started." />}
      columns={[
        { header: 'Name', key: 'name', render: (row) => <span className="font-medium">{row.name}</span> },
        { header: 'Code', key: 'code', render: (row) => row.code },
        { header: 'Sort Order', key: 'sortOrder', render: (row) => row.sortOrder },
        { header: 'Status', key: 'status', render: (row) => <StatusBadge status={row.status} /> },
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
