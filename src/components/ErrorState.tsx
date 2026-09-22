import { HugeiconsIcon } from '@hugeicons/react'
import { Alert02Icon } from '@hugeicons/core-free-icons'
import { Button } from './Button'
import { getErrorMessage } from '../services/api'

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <HugeiconsIcon icon={Alert02Icon} size={32} className="text-black/30 dark:text-white/30" />
      <div>
        <p className="text-sm font-medium">Something went wrong</p>
        <p className="mt-1 text-sm text-black/50 dark:text-white/50">{getErrorMessage(error)}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  )
}
