import { PageHeader } from '../components/PageHeader'
import { Skeleton } from '../components/Skeleton'
import { ErrorState } from '../components/ErrorState'
import { PricingSettingsForm } from '../features/pricing/PricingSettingsForm'
import { usePricingSettings, useUpdatePricingSettings } from '../features/pricing/hooks/usePricingSettings'

export function PricingSettingsPage() {
  const settingsQuery = usePricingSettings()
  const updateSettings = useUpdatePricingSettings()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pricing Settings"
        description="Configure the cost inputs used to calculate recommended selling prices and order profitability."
      />

      {settingsQuery.isLoading ? (
        <Skeleton className="h-[480px] w-full max-w-2xl rounded-xl" />
      ) : settingsQuery.isError || !settingsQuery.data ? (
        <ErrorState error={settingsQuery.error} onRetry={() => settingsQuery.refetch()} />
      ) : (
        <PricingSettingsForm
          settings={settingsQuery.data}
          isSubmitting={updateSettings.isPending}
          onSubmit={(values) => updateSettings.mutate(values)}
        />
      )}
    </div>
  )
}
