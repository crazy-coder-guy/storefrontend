import { HugeiconsIcon } from '@hugeicons/react'
import { CheckmarkCircle02Icon, Moon02Icon, Sun03Icon } from '@hugeicons/core-free-icons'
import { useTheme, type Theme } from '../../context/ThemeContext'
import { cn } from '../../utils/cn'

const OPTIONS: { value: Theme; label: string; description: string; icon: typeof Sun03Icon }[] = [
  { value: 'light', label: 'Light', description: 'Bright background, dark text.', icon: Sun03Icon },
  { value: 'dark', label: 'Dark', description: 'Dark background, light text.', icon: Moon02Icon },
]

export function ThemeSettings() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="max-w-lg rounded-xl border border-black/10 p-5 dark:border-white/10">
      <h2 className="text-sm font-semibold">Theme</h2>
      <p className="mt-1 text-sm text-black/50 dark:text-white/50">
        Choose how the admin dashboard looks on this device.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {OPTIONS.map((option) => {
          const active = theme === option.value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setTheme(option.value)}
              aria-pressed={active}
              className={cn(
                'relative flex flex-col items-start gap-2 rounded-xl border p-4 text-left cursor-pointer',
                active
                  ? 'border-black bg-black/5 dark:border-white dark:bg-white/10'
                  : 'border-black/10 hover:bg-black/[0.02] dark:border-white/10 dark:hover:bg-white/5'
              )}
            >
              {active && (
                <HugeiconsIcon
                  icon={CheckmarkCircle02Icon}
                  size={18}
                  className="absolute right-3 top-3 text-black dark:text-white"
                />
              )}
              <HugeiconsIcon icon={option.icon} size={20} />
              <span className="text-sm font-medium">{option.label}</span>
              <span className="text-xs text-black/50 dark:text-white/50">{option.description}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
