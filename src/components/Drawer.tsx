import { useEffect, useState, type ReactNode } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Cancel01Icon } from '@hugeicons/core-free-icons'

interface DrawerProps {
  open: boolean
  onClose: () => void
  title?: ReactNode
  children: ReactNode
  widthClassName?: string
}

export function Drawer({ open, onClose, title, children, widthClassName = 'sm:max-w-2xl lg:max-w-3xl' }: DrawerProps) {
  const [mounted, setMounted] = useState(open)
  const [active, setActive] = useState(open)

  useEffect(() => {
    if (open) {
      setMounted(true)
      const timer = setTimeout(() => {
        requestAnimationFrame(() => setActive(true))
      }, 20)
      return () => clearTimeout(timer)
    } else {
      setActive(false)
      const timer = setTimeout(() => setMounted(false), 500)
      return () => clearTimeout(timer)
    }
  }, [open])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
      {/* Backdrop Fade Animation */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-500 ease-out dark:bg-black/70 ${
          active ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Drawer Slide-in Animation & Responsive Container */}
      <div
        className={`relative z-10 flex h-full w-full ${widthClassName} flex-col border-l border-black/10 bg-white shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] dark:border-white/10 dark:bg-black ${
          active ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/10 px-4 py-3.5 sm:px-6 sm:py-4 dark:border-white/10">
          <div className="min-w-0 flex-1 pr-3 text-base sm:text-lg font-semibold">{title}</div>
          <button
            onClick={onClose}
            aria-label="Close drawer"
            className="rounded-lg p-1.5 text-black/60 hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/10 cursor-pointer transition-colors"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={20} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</div>
      </div>
    </div>
  )
}
