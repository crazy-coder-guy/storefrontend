import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons'
import type { PaginationMeta } from '../types'

interface PaginationProps {
  meta: PaginationMeta
  onPageChange: (page: number) => void
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
  const { page, totalPages, total } = meta
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between border-t border-black/10 px-4 py-3 text-sm dark:border-white/10">
      <span className="text-black/50 dark:text-white/50">
        Page {page} of {totalPages} · {total} total
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex items-center gap-1 rounded-lg border border-black/15 px-2.5 py-1.5 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/20"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
          Prev
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="flex items-center gap-1 rounded-lg border border-black/15 px-2.5 py-1.5 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/20"
        >
          Next
          <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
        </button>
      </div>
    </div>
  )
}
