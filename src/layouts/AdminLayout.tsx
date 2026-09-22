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

const ROUTE_TITLES: Array<{ test: RegExp; title: string }> = [
  { test: /^\/dashboard/, title: 'Dashboard' },
  { test: /^\/products\/new/, title: 'New Product' },
  { test: /^\/products\/[^/]+\/edit/, title: 'Edit Product' },
  { test: /^\/products\/[^/]+/, title: 'Product Details' },
  { test: /^\/products/, title: 'Products' },
  { test: /^\/categories/, title: 'Categories' },
  { test: /^\/inventory\/[^/]+\/history/, title: 'Inventory History' },
  { test: /^\/inventory/, title: 'Inventory' },
  { test: /^\/sizes/, title: 'Sizes' },
  { test: /^\/colors/, title: 'Colors' },
  { test: /^\/settings/, title: 'Settings' },
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
        mobileOpen && (
          <div className="fixed inset-0 z-40 flex">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
            <div className="relative z-10">
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        )
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-black/10 px-4 py-3 dark:border-white/10">
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

          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-black/70 hover:bg-black/5 dark:text-white/70 dark:hover:bg-white/10"
            aria-label="Toggle theme"
          >
            <HugeiconsIcon icon={theme === 'dark' ? Sun03Icon : Moon02Icon} size={20} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
