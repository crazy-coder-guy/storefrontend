import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '../utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, label, error, hint, id, ...props },
  ref
) {
  const inputId = id ?? props.name
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-black/80 dark:text-white/80">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={cn(
          'rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-black outline-none transition-colors placeholder:text-black/30 focus:border-black/40 dark:border-white/20 dark:bg-black dark:text-white dark:placeholder:text-white/30 dark:focus:border-white/40',
          error && 'border-red-500 dark:border-red-400',
          className
        )}
        {...props}
      />
      {hint && !error && <p className="text-xs text-black/50 dark:text-white/50">{hint}</p>}
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
})
