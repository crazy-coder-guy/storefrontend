import { HugeiconsIcon } from '@hugeicons/react'
import { Delete02Icon, Edit02Icon } from '@hugeicons/core-free-icons'
import { Table } from '../../components/Table'
import { SkeletonRows } from '../../components/Skeleton'
import { EmptyState } from '../../components/EmptyState'
import { ErrorState } from '../../components/ErrorState'
import { StatusBadge } from '../../components/Badge'
import type { Color } from '../../types'

interface ColorTableProps {
  colors: Color[]
  isLoading: boolean
  isError: boolean
  error: unknown
  onRetry: () => void
  onEdit: (color: Color) => void
  onDelete: (color: Color) => void
}

export function ColorTable({ colors, isLoading, isError, error, onRetry, onEdit, onDelete }: ColorTableProps) {
  return (
    <Table<Color>
      rowKey={(row) => row.id}
      data={colors}
      isLoading={isLoading}
      loadingRows={<SkeletonRows cols={5} />}
      isError={isError}
      errorContent={<ErrorState error={error} onRetry={onRetry} />}
      emptyContent={<EmptyState title="No colors yet" description="Add your first color to get started." />}
      columns={[
        {
          header: 'Swatch',
          key: 'swatch',
          render: (row) => (
            <span
              className="inline-block h-5 w-5 rounded-full border border-black/15 dark:border-white/20"
              style={{ backgroundColor: row.hexCode }}
            />
          ),
        },
        { header: 'Name', key: 'name', render: (row) => <span className="font-medium">{row.name}</span> },
        { header: 'Code', key: 'code', render: (row) => row.code },
        { header: 'Hex', key: 'hex', render: (row) => row.hexCode },
        { header: 'Status', key: 'status', render: (row) => <StatusBadge status={row.status} /> },
        {
          header: 'Actions',
          key: 'actions',
          className: 'text-right',
          render: (row) => (
            <div className="flex items-center justify-end gap-1.5">
              <button
                type="button"
                onClick={() => onEdit(row)}
                className="inline-flex items-center gap-1 rounded-md border border-black/10 bg-white px-2.5 py-1 text-xs font-medium text-black/80 hover:bg-black/5 hover:text-black shadow-2xs cursor-pointer dark:border-white/10 dark:bg-black dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white transition-colors"
              >
                <HugeiconsIcon icon={Edit02Icon} size={14} />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={() => onDelete(row)}
                disabled={row.status === 'INACTIVE'}
                className="inline-flex items-center gap-1 rounded-md border border-red-200/50 bg-rose-50/50 px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-100/70 disabled:opacity-40 cursor-pointer dark:border-red-900/40 dark:bg-rose-950/20 dark:text-rose-400 dark:hover:bg-rose-900/30 transition-colors"
                title="Deactivate color"
              >
                <HugeiconsIcon icon={Delete02Icon} size={14} />
                <span>Delete</span>
              </button>
            </div>
          ),
        },
      ]}
    />
  )
}
