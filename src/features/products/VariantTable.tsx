import { HugeiconsIcon } from '@hugeicons/react'
import { Delete02Icon, Edit02Icon } from '@hugeicons/core-free-icons'
import { Table } from '../../components/Table'
import { EmptyState } from '../../components/EmptyState'
import { StatusBadge } from '../../components/Badge'
import { formatCurrency } from '../../utils/formatCurrency'
import type { ProductVariant } from '../../types'

interface VariantTableProps {
  variants: ProductVariant[]
  onEdit: (variant: ProductVariant) => void
  onDelete: (variant: ProductVariant) => void
}

export function VariantTable({ variants, onEdit, onDelete }: VariantTableProps) {
  return (
    <Table<ProductVariant>
      rowKey={(row) => row.id}
      data={variants}
      emptyContent={
        <EmptyState title="No variants yet" description="Add a color/size combination to start selling this product." />
      }
      columns={[
        { header: 'SKU', key: 'sku', render: (row) => <span className="font-medium">{row.sku}</span> },
        { header: 'Color', key: 'color', render: (row) => row.color?.name ?? '—' },
        { header: 'Size', key: 'size', render: (row) => row.size?.name ?? '—' },
        { header: 'Price', key: 'price', render: (row) => (row.price != null ? formatCurrency(row.price) : '—') },
        { header: 'Stock', key: 'stock', render: (row) => row.stockQuantity },
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
