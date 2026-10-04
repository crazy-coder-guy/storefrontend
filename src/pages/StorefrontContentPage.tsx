import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { Skeleton } from '../components/Skeleton'
import { ErrorState } from '../components/ErrorState'
import { Button } from '../components/Button'
import { StorefrontSettingsForm } from '../features/storefront/StorefrontSettingsForm'
import { FeaturedProductsPicker } from '../features/storefront/FeaturedProductsPicker'
import { MaintenanceModal } from '../features/storefront/MaintenanceModal'
import {
  useStorefrontSettings,
  useUpdateStorefrontSettings,
} from '../features/storefront/hooks/useStorefrontSettings'
import {
  useFeaturedProducts,
  useSetFeaturedProducts,
} from '../features/storefront/hooks/useFeaturedProducts'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Layout01Icon,
  StarIcon,
  Alert02Icon,
  Clock01Icon,
} from '@hugeicons/core-free-icons'
import { cn } from '../utils/cn'

type TabType = 'homepage' | 'featured'

export function StorefrontContentPage() {
  const [activeTab, setActiveTab] = useState<TabType>('homepage')
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false)

  const settingsQuery = useStorefrontSettings()
  const updateSettings = useUpdateStorefrontSettings()

  const featuredQuery = useFeaturedProducts()
  const setFeatured = useSetFeaturedProducts()

  const isMaintenanceActive = Boolean(
    settingsQuery.data?.isMaintenance &&
      (!settingsQuery.data.maintenanceUntil || new Date(settingsQuery.data.maintenanceUntil) > new Date())
  )

  const tabs = [
    {
      id: 'homepage' as const,
      label: 'Homepage & Banner Copy',
      description: 'Announcement bar, hero headline, and supporting tagline',
      icon: Layout01Icon,
    },
    {
      id: 'featured' as const,
      label: 'Top Selling Products',
      description: 'Curated products displayed in the Top Selling section',
      icon: StarIcon,
      badge: featuredQuery.data?.length !== undefined ? featuredQuery.data.length : undefined,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Storefront Content"
        description="Manage the copy and featured products shown on the customer-facing website."
        actions={
          <Button
            variant={isMaintenanceActive ? 'danger' : 'secondary'}
            onClick={() => setIsMaintenanceModalOpen(true)}
            className="gap-2 font-semibold"
          >
            <span
              className={cn(
                'h-2 w-2 rounded-full',
                isMaintenanceActive ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'
              )}
            />
            <HugeiconsIcon icon={isMaintenanceActive ? Alert02Icon : Clock01Icon} size={16} />
            {isMaintenanceActive ? 'Maintenance Mode Active' : 'Maintenance Mode'}
          </Button>
        }
      />

      {/* Prominent Banner if Maintenance is currently active */}
      {isMaintenanceActive && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200">
          <div className="flex items-start sm:items-center gap-3">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-300 shrink-0">
              <HugeiconsIcon icon={Alert02Icon} size={20} />
            </span>
            <div className="space-y-0.5">
              <p className="text-sm font-bold">Storefront Maintenance Mode is Currently ON</p>
              <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
                Shoppers are seeing the maintenance countdown page.
                {settingsQuery.data?.maintenanceUntil && (
                  <span className="font-semibold ml-1">
                    Auto turns off at {new Date(settingsQuery.data.maintenanceUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(settingsQuery.data.maintenanceUntil).toLocaleDateString()}).
                  </span>
                )}
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            className="border-amber-500/30 bg-white/50 dark:bg-black/30 hover:bg-white dark:hover:bg-black/60 shrink-0 font-medium"
            onClick={() => setIsMaintenanceModalOpen(true)}
          >
            Manage Maintenance
          </Button>
        </div>
      )}

      <MaintenanceModal
        open={isMaintenanceModalOpen}
        onClose={() => setIsMaintenanceModalOpen(false)}
        settings={settingsQuery.data}
      />

      {/* Segmented Tab Navigation Bar */}
      <div className="flex border-b border-black/10 dark:border-white/10 gap-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'group relative flex items-center gap-2.5 border-b-2 px-5 py-3 text-sm font-semibold transition-all cursor-pointer -mb-[1px]',
                isActive
                  ? 'border-black text-black dark:border-white dark:text-white'
                  : 'border-transparent text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white'
              )}
            >
              <HugeiconsIcon
                icon={tab.icon}
                size={18}
                className={cn(
                  'transition-colors',
                  isActive ? 'text-black dark:text-white' : 'text-black/40 group-hover:text-black dark:text-white/40 dark:group-hover:text-white'
                )}
              />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-bold transition-colors',
                    isActive
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'bg-black/5 text-black/60 dark:bg-white/10 dark:text-white/60'
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tab Panels */}
      <div className="pt-1">
        {activeTab === 'homepage' && (
          <div>
            {settingsQuery.isLoading ? (
              <Skeleton className="h-64 w-full max-w-2xl rounded-xl" />
            ) : settingsQuery.isError || !settingsQuery.data ? (
              <ErrorState error={settingsQuery.error} onRetry={() => settingsQuery.refetch()} />
            ) : (
              <StorefrontSettingsForm
                settings={settingsQuery.data}
                isSubmitting={updateSettings.isPending}
                onSubmit={(values) => updateSettings.mutate(values)}
              />
            )}
          </div>
        )}

        {activeTab === 'featured' && (
          <div>
            {featuredQuery.isLoading ? (
              <Skeleton className="h-64 w-full max-w-3xl rounded-xl" />
            ) : featuredQuery.isError ? (
              <ErrorState error={featuredQuery.error} onRetry={() => featuredQuery.refetch()} />
            ) : (
              <FeaturedProductsPicker
                featured={featuredQuery.data ?? []}
                isSubmitting={setFeatured.isPending}
                onSave={(productIds) => setFeatured.mutate(productIds)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
