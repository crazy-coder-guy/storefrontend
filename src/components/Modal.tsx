import { HugeiconsIcon } from '@hugeicons/react'
import { Cancel01Icon } from '@hugeicons/core-free-icons'
import type { ReactNode } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  widthClassName?: string
}

export function Modal({ open, onClose, title, children, widthClassName = 'max-w-lg' }: ModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 dark:bg-white/10" onClick={onClose} />
      <div
        className={`relative z-10 w-full ${widthClassName} max-h-[90vh] overflow-y-auto rounded-xl border border-black/10 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-black`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-black/60 hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/10"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
