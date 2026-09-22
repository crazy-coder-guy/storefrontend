import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cn } from '../utils/cn'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, label, error, id, children, ...props },
  ref
) {
  const selectId = id ?? props.name
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-black/80 dark:text-white/80">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={cn(
          'rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-black outline-none transition-colors focus:border-black/40 dark:border-white/20 dark:bg-black dark:text-white dark:focus:border-white/40',
          error && 'border-red-500 dark:border-red-400',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
})
