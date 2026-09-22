import { HugeiconsIcon } from '@hugeicons/react'
import { InboxIcon } from '@hugeicons/core-free-icons'
import type { IconSvgElement } from '@hugeicons/react'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: IconSvgElement
  action?: React.ReactNode
}

export function EmptyState({ title, description, icon = InboxIcon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <HugeiconsIcon icon={icon} size={32} className="text-black/30 dark:text-white/30" />
      <div>
        <p className="text-sm font-medium">{title}</p>
        {description && <p className="mt-1 text-sm text-black/50 dark:text-white/50">{description}</p>}
      </div>
      {action}
    </div>
  )
}
