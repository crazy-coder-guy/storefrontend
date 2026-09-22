import { HugeiconsIcon } from '@hugeicons/react'
import type { IconSvgElement } from '@hugeicons/react'
import {
  ChartHistogramIcon,
  CheckmarkSquare01Icon,
  ColorsIcon,
  PackageIcon,
  Settings01Icon,
  Store01Icon,
  TShirtIcon,
  TapeMeasureIcon,
} from '@hugeicons/core-free-icons'
import { NavLink } from 'react-router-dom'
import { cn } from '../utils/cn'

interface NavItem {
  label: string
  to: string
  icon: IconSvgElement
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: ChartHistogramIcon },
  { label: 'Products', to: '/products', icon: TShirtIcon },
  { label: 'Categories', to: '/categories', icon: CheckmarkSquare01Icon },
  { label: 'Inventory', to: '/inventory', icon: PackageIcon },
  { label: 'Sizes', to: '/sizes', icon: TapeMeasureIcon },
  { label: 'Colors', to: '/colors', icon: ColorsIcon },
  { label: 'Settings', to: '/settings', icon: Settings01Icon },
]

interface SidebarProps {
  collapsed?: boolean
  onNavigate?: () => void
}

export function Sidebar({ collapsed = false, onNavigate }: SidebarProps) {
  return (
    <aside
      className={cn(
        'flex h-full flex-col justify-between border-r border-black/10 bg-white dark:border-white/10 dark:bg-black',
        collapsed ? 'w-18' : 'w-64'
      )}
    >
      <div>
        <div className="flex items-center gap-2 px-6 py-6">
          <HugeiconsIcon icon={Store01Icon} size={22} strokeWidth={1.8} />
          {!collapsed && <span className="text-lg font-bold tracking-tight">Store Admin</span>}
        </div>

        <nav className="flex flex-col gap-1 px-3">
          {NAV_ITEMS.map(({ label, to, icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onNavigate}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'text-black/70 hover:bg-black/5 dark:text-white/70 dark:hover:bg-white/10'
                )
              }
            >
              <HugeiconsIcon icon={icon} size={20} strokeWidth={1.8} />
              {!collapsed && label}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  )
}
