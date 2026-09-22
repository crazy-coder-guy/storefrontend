import { cn } from '../utils/cn'
import type { StockStatus } from '../types'
import { STOCK_STATUS_LABEL } from '../utils/stockStatus'

interface BadgeProps {
  children: React.ReactNode
  className?: string
}

export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-black/15 px-2.5 py-0.5 text-xs font-medium dark:border-white/20',
        className
      )}
    >
      {children}
    </span>
  )
}

const STATUS_TEXT_CLASSES: Record<string, string> = {
  ACTIVE: 'text-emerald-600 dark:text-emerald-400',
  INACTIVE: 'text-rose-600 dark:text-rose-400',
  DRAFT: 'text-amber-600 dark:text-amber-400',
  PENDING: 'text-amber-600 dark:text-amber-400',
  PROCESSING: 'text-blue-600 dark:text-blue-400',
  SHIPPED: 'text-indigo-600 dark:text-indigo-400',
  DELIVERED: 'text-emerald-600 dark:text-emerald-400',
  CANCELLED: 'text-rose-600 dark:text-rose-400',
}

const STATUS_DOT_CLASSES: Record<string, string> = {
  ACTIVE: 'bg-emerald-500',
  INACTIVE: 'bg-rose-500',
  DRAFT: 'bg-amber-500',
  PENDING: 'bg-amber-500',
  PROCESSING: 'bg-blue-500',
  SHIPPED: 'bg-indigo-500',
  DELIVERED: 'bg-emerald-500',
  CANCELLED: 'bg-rose-500',
}

export function StatusBadge({ status, showDot = true }: { status: string; showDot?: boolean }) {
  const textColor = STATUS_TEXT_CLASSES[status] ?? 'text-gray-600 dark:text-gray-400'
  const dotColor = STATUS_DOT_CLASSES[status] ?? 'bg-gray-400'

  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase', textColor)}>
      {showDot && <span className={cn('h-1.5 w-1.5 rounded-full', dotColor)} />}
      {status}
    </span>
  )
}

const STOCK_DOT_CLASSES: Record<StockStatus, string> = {
  'in-stock': 'bg-emerald-500',
  'low-stock': 'bg-amber-500',
  'out-of-stock': 'bg-red-500',
}

export function StockBadge({ status }: { status: StockStatus }) {
  return (
    <Badge>
      <span className={cn('h-1.5 w-1.5 rounded-full', STOCK_DOT_CLASSES[status])} />
      {STOCK_STATUS_LABEL[status]}
    </Badge>
  )
}
