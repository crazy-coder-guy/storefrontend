import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Menu01Icon,
  Moon02Icon,
  SidebarLeftIcon,
  Sun03Icon,
} from '@hugeicons/core-free-icons'
import { Sidebar } from '../components/Sidebar'
import { useTheme } from '../context/ThemeContext'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useStorefrontSettings } from '../features/storefront/hooks/useStorefrontSettings'
import { MaintenanceModal } from '../features/storefront/MaintenanceModal'
import { cn } from '../utils/cn'

const ROUTE_TITLES: Array<{ test: RegExp; title: string }> = [
  { test: /^\/dashboard/, title: 'Dashboard' },
  { test: /^\/products\/new/, title: 'New Product' },
  { test: /^\/products\/[^/]+\/edit/, title: 'Edit Product' },
  { test: /^\/products\/[^/]+/, title: 'Product Details' },
  { test: /^\/products/, title: 'Products' },
  { test: /^\/orders/, title: 'Orders & Fulfillments' },
  { test: /^\/customers/, title: 'Customers' },
  { test: /^\/attributes/, title: 'Product Attributes' },
  { test: /^\/categories/, title: 'Product Attributes' },
  { test: /^\/sizes/, title: 'Product Attributes' },
  { test: /^\/colors/, title: 'Product Attributes' },
]

function getPageTitle(pathname: string) {
  return ROUTE_TITLES.find((r) => r.test.test(pathname))?.title ?? 'Store Admin'
}

const COLLAPSE_KEY = 'admin-sidebar-collapsed'

export function AdminLayout() {
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSE_KEY) === 'true')
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false)

  const settingsQuery = useStorefrontSettings()
  const settings = settingsQuery.data

  const isMaintenanceActive = Boolean(
    settings?.isMaintenance &&
      (!settings.maintenanceUntil || new Date(settings.maintenanceUntil) > new Date())
  )

  useEffect(() => {
    localStorage.setItem(COLLAPSE_KEY, String(collapsed))
  }, [collapsed])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const title = getPageTitle(location.pathname)

  return (
    <div className="flex h-screen overflow-hidden bg-white text-black dark:bg-black dark:text-white">
      {isDesktop ? (
        <Sidebar collapsed={collapsed} />
      ) : (
        <div
          className={cn(
            'fixed inset-0 z-40 flex transition-opacity duration-300 ease-in-out',
            mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
          )}
        >
          <div
            className="absolute inset-0 bg-black/40 transition-opacity duration-300"
            onClick={() => setMobileOpen(false)}
          />
          <div
            className={cn(
              'relative z-10 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] transform',
              mobileOpen ? 'translate-x-0' : '-translate-x-full'
            )}
          >
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-black/10 px-4 py-2.5 dark:border-white/10">
          <div className="flex items-center gap-3">
            {isDesktop ? (
              <button
                onClick={() => setCollapsed((c) => !c)}
                className="rounded-lg p-2 text-black/70 hover:bg-black/5 dark:text-white/70 dark:hover:bg-white/10"
                aria-label="Toggle sidebar"
              >
                <HugeiconsIcon icon={SidebarLeftIcon} size={20} />
              </button>
            ) : (
              <button
                onClick={() => setMobileOpen(true)}
                className="rounded-lg p-2 text-black/70 hover:bg-black/5 dark:text-white/70 dark:hover:bg-white/10"
                aria-label="Open menu"
              >
                <HugeiconsIcon icon={Menu01Icon} size={20} />
              </button>
            )}
            <h1 className="text-base font-semibold">{title}</h1>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Maintenance Mode Button / Status Badge */}
            <button
              type="button"
              onClick={() => setIsMaintenanceModalOpen(true)}
              className={cn(
                'inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer shadow-2xs',
                isMaintenanceActive
                  ? 'border border-amber-500/40 bg-amber-500/15 text-amber-800 hover:bg-amber-500/25 dark:border-amber-400/40 dark:bg-amber-400/20 dark:text-amber-300'
                  : 'border border-black/10 bg-gray-50 text-black/70 hover:bg-black/5 hover:text-black dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white'
              )}
              title="Configure Storefront Maintenance Mode"
            >
              <span
                className={cn(
                  'h-2 w-2 rounded-full shrink-0',
                  isMaintenanceActive ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'
                )}
              />
              <span className="truncate">
                {isMaintenanceActive ? 'Maintenance: Active' : 'Store: Live'}
              </span>
            </button>

            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-black/70 hover:bg-black/5 dark:text-white/70 dark:hover:bg-white/10 transition-transform duration-200 active:scale-90"
              aria-label="Toggle theme"
            >
              <div className="transition-transform duration-300 hover:rotate-45">
                <HugeiconsIcon icon={theme === 'dark' ? Sun03Icon : Moon02Icon} size={20} />
              </div>
            </button>
          </div>
        </header>

        {/* Maintenance Configuration Modal */}
        <MaintenanceModal
          open={isMaintenanceModalOpen}
          onClose={() => setIsMaintenanceModalOpen(false)}
          settings={settings}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
