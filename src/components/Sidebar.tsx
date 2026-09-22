import { HugeiconsIcon } from '@hugeicons/react'
import type { IconSvgElement } from '@hugeicons/react'
import {
  ChartHistogramIcon,
  ColorsIcon,
  PackageIcon,
  Store01Icon,
  TShirtIcon,
  ShoppingBag01Icon,
  UserGroupIcon,
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
  { label: 'Orders', to: '/orders', icon: ShoppingBag01Icon },
  { label: 'Customers', to: '/customers', icon: UserGroupIcon },
  { label: 'Attributes', to: '/attributes', icon: ColorsIcon },
  { label: 'Inventory', to: '/inventory', icon: PackageIcon },
]

interface SidebarProps {
  collapsed?: boolean
  onNavigate?: () => void
}

export function Sidebar({ collapsed = false, onNavigate }: SidebarProps) {
  return (
    <aside
      className={cn(
        'flex h-full flex-col justify-between overflow-y-auto overflow-x-hidden border-r border-black/10 bg-white dark:border-white/10 dark:bg-black transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shrink-0',
        collapsed ? 'w-18' : 'w-64'
      )}
    >
      <div>
        <div className="flex items-center gap-3 px-5 py-5 overflow-hidden">
          <div className="flex shrink-0 items-center justify-center">
            <HugeiconsIcon icon={Store01Icon} size={22} strokeWidth={1.8} />
          </div>
          <span
            className={cn(
              'text-lg font-bold tracking-tight whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] origin-left',
              collapsed ? 'opacity-0 max-w-0 overflow-hidden pointer-events-none scale-95' : 'opacity-100 max-w-[200px] scale-100'
            )}
          >
            Store Admin
          </span>
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
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-200 overflow-hidden',
                  isActive
                    ? 'bg-black text-white dark:bg-white dark:text-black font-medium'
                    : 'text-black/70 hover:bg-black/5 dark:text-white/70 dark:hover:bg-white/10'
                )
              }
            >
              <div className="flex shrink-0 items-center justify-center">
                <HugeiconsIcon icon={icon} size={20} strokeWidth={1.8} />
              </div>
              <span
                className={cn(
                  'whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] origin-left',
                  collapsed ? 'opacity-0 max-w-0 overflow-hidden pointer-events-none scale-95' : 'opacity-100 max-w-[160px] scale-100'
                )}
              >
                {label}
              </span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  )
}
