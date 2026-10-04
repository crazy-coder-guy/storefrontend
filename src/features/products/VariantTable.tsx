import { HugeiconsIcon } from '@hugeicons/react'
import { Delete02Icon, Edit02Icon, Image01Icon } from '@hugeicons/core-free-icons'
import { Table } from '../../components/Table'
import { EmptyState } from '../../components/EmptyState'
import { StatusBadge } from '../../components/Badge'
import { ColorSwatch } from '../../components/ColorSwatch'
import { formatCurrency } from '../../utils/formatCurrency'
import type { ProductImage, ProductVariant } from '../../types'

interface VariantTableProps {
  variants: ProductVariant[]
  images?: ProductImage[]
  onEdit: (variant: ProductVariant) => void
  onDelete: (variant: ProductVariant) => void
  onManagePhotos?: (variant: ProductVariant) => void
}

export function VariantTable({
  variants,
  images = [],
  onEdit,
  onDelete,
  onManagePhotos,
}: VariantTableProps) {
  function getVariantImage(row: ProductVariant): ProductImage | undefined {
    if (row.colorId) {
      return (
        images.find((i) => i.colorId === row.colorId && (i.sortOrder === 0 || i.isPrimary)) ??
        images.find((i) => i.colorId === row.colorId)
      )
    }
    return (
      images.find((i) => !i.colorId && (i.sortOrder === 0 || i.isPrimary)) ??
      images.find((i) => !i.colorId)
    )
  }

  return (
    <Table<ProductVariant>
      rowKey={(row) => row.id}
      data={variants}
      emptyContent={
        <EmptyState title="No variants yet" description="Add a color/size combination to start selling this product." />
      }
      columns={[
        {
          header: '',
          key: 'image',
          className: 'w-12',
          render: (row) => {
            const img = getVariantImage(row)
            return (
              <div
                onClick={() => onManagePhotos?.(row)}
                className="group relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-black/10 bg-gray-100 dark:border-white/10 dark:bg-gray-800 cursor-pointer"
                title={img ? 'Click to view / edit photos' : 'Click to add photos'}
              >
                {img ? (
                  <img
                    src={img.imageUrl}
                    alt=""
                    className="h-full w-full object-cover transition-transform group-hover:scale-110"
                  />
                ) : (
                  <HugeiconsIcon
                    icon={Image01Icon}
                    size={16}
                    className="text-black/30 group-hover:text-black/70 dark:text-white/30 dark:group-hover:text-white/70 transition-colors"
                  />
                )}
              </div>
            )
          },
        },
        { header: 'SKU', key: 'sku', render: (row) => <span className="font-medium font-mono text-xs">{row.sku}</span> },
        {
          header: 'Color',
          key: 'color',
          render: (row) => <ColorSwatch hexCode={row.color?.hexCode} name={row.color?.name} />,
        },
        { header: 'Size', key: 'size', render: (row) => row.size?.code ?? '—' },
        { header: 'Price', key: 'price', render: (row) => (row.price != null ? formatCurrency(row.price) : '—') },
        { header: 'Stock', key: 'stock', render: (row) => row.stockQuantity },
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
                className="inline-flex items-center gap-1 rounded-md border border-red-200/50 bg-rose-50/50 px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-100/70 disabled:opacity-40 cursor-pointer dark:border-red-900/40 dark:bg-rose-950/20 dark:text-rose-400 dark:hover:bg-rose-900/30 transition-colors"
                title="Deactivate variant"
              >
                <HugeiconsIcon icon={Delete02Icon} size={14} />
              </button>
            </div>
          ),
        },
      ]}
    />
  )
}
