import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '../utils/cn'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, label, error, id, ...props },
  ref
) {
  const areaId = id ?? props.name
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={areaId} className="text-sm font-medium text-black/80 dark:text-white/80">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={areaId}
        className={cn(
          'rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-black outline-none transition-colors placeholder:text-black/30 focus:border-black/40 dark:border-white/20 dark:bg-black dark:text-white dark:placeholder:text-white/30 dark:focus:border-white/40',
          error && 'border-red-500 dark:border-red-400',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
})
