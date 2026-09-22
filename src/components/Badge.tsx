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

const STATUS_CLASSES: Record<string, string> = {
  ACTIVE: '',
  INACTIVE: 'opacity-60',
  DRAFT: 'border-dashed',
}

export function StatusBadge({ status }: { status: string }) {
  return <Badge className={STATUS_CLASSES[status] ?? ''}>{status}</Badge>
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
