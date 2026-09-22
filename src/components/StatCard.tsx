import { HugeiconsIcon } from '@hugeicons/react'
import type { IconSvgElement } from '@hugeicons/react'

interface StatCardProps {
  label: string
  value: string | number
  icon: IconSvgElement
  hint?: string
}

export function StatCard({ label, value, icon, hint }: StatCardProps) {
  return (
    <div className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-black">
      <div className="flex items-center justify-between">
        <span className="text-sm text-black/50 dark:text-white/50">{label}</span>
        <HugeiconsIcon icon={icon} size={18} className="text-black/40 dark:text-white/40" />
      </div>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      {hint && <p className="mt-1 text-xs text-black/40 dark:text-white/40">{hint}</p>}
    </div>
  )
}
