import { HugeiconsIcon } from '@hugeicons/react'
import { Delete02Icon, Edit02Icon } from '@hugeicons/core-free-icons'
import { Table } from '../../components/Table'
import { SkeletonRows } from '../../components/Skeleton'
import { EmptyState } from '../../components/EmptyState'
import { ErrorState } from '../../components/ErrorState'
import { StatusBadge } from '../../components/Badge'
import type { Coupon } from '../../types'

interface CouponTableProps {
  coupons: Coupon[]
  isLoading: boolean
  isError: boolean
  error: unknown
  onRetry: () => void
  onEdit: (coupon: Coupon) => void
  onDelete: (coupon: Coupon) => void
}

function formatDiscount(coupon: Coupon) {
  return coupon.type === 'PERCENTAGE' ? `${Number(coupon.value)}% off` : `₹${Number(coupon.value)} off`
}

function formatExpiry(expiresAt: string | null) {
  if (!expiresAt) return 'Never'
  const date = new Date(expiresAt)
  const isPast = date.getTime() < Date.now()
  return (
    <span className={isPast ? 'text-rose-600 dark:text-rose-400' : undefined}>
      {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
      {isPast ? ' (expired)' : ''}
    </span>
  )
}

export function CouponTable({ coupons, isLoading, isError, error, onRetry, onEdit, onDelete }: CouponTableProps) {
  return (
    <Table<Coupon>
      rowKey={(row) => row.id}
      data={coupons}
      isLoading={isLoading}
      loadingRows={<SkeletonRows cols={7} />}
      isError={isError}
      errorContent={<ErrorState error={error} onRetry={onRetry} />}
      emptyContent={<EmptyState title="No coupons yet" description="Create your first coupon code to get started." />}
      columns={[
        { header: 'Code', key: 'code', render: (row) => <span className="font-mono font-medium">{row.code}</span> },
        { header: 'Discount', key: 'value', render: (row) => formatDiscount(row) },
        {
          header: 'Min. order',
          key: 'minOrderValue',
          render: (row) => (row.minOrderValue != null ? `₹${Number(row.minOrderValue)}` : '—'),
        },
        {
          header: 'Usage',
          key: 'usedCount',
          render: (row) => `${row.usedCount}${row.usageLimit != null ? ` / ${row.usageLimit}` : ''}`,
        },
        { header: 'Expires', key: 'expiresAt', render: (row) => formatExpiry(row.expiresAt) },
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
                disabled={row.usedCount > 0}
                title={row.usedCount > 0 ? 'Already redeemed — deactivate instead of deleting' : 'Delete coupon'}
                className="inline-flex items-center gap-1 rounded-md border border-red-200/50 bg-rose-50/50 px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-100/70 disabled:opacity-40 cursor-pointer dark:border-red-900/40 dark:bg-rose-950/20 dark:text-rose-400 dark:hover:bg-rose-900/30 transition-colors"
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
