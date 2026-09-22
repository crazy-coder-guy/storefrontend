import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '../utils/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    'bg-black text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80',
  secondary:
    'border border-black/15 text-black hover:bg-black/5 dark:border-white/20 dark:text-white dark:hover:bg-white/10',
  ghost: 'text-black/70 hover:bg-black/5 dark:text-white/70 dark:hover:bg-white/10',
  danger:
    'border border-red-600/40 text-red-600 hover:bg-red-600/10 dark:border-red-400/40 dark:text-red-400 dark:hover:bg-red-400/10',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        VARIANT_CLASSES[variant],
        className
      )}
      {...props}
    />
  )
})
