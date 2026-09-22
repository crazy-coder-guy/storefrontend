import { PageHeader } from '../components/PageHeader'
import { Skeleton } from '../components/Skeleton'
import { SettingsForm } from '../features/settings/SettingsForm'
import { useSaveSettings, useSettings } from '../features/settings/hooks/useSettings'
import { DEFAULT_SETTINGS } from '../services/settings.service'

export function SettingsPage() {
  const { data, isLoading } = useSettings()
  const saveMutation = useSaveSettings()

  return (
    <div>
      <PageHeader title="Settings" description="Store details and admin preferences." />

      {isLoading && <Skeleton className="h-96 w-full max-w-lg rounded-xl" />}

      {!isLoading && (
        <SettingsForm
          values={data ?? DEFAULT_SETTINGS}
          onSubmit={(values) =>
            saveMutation.mutate({
              ...values,
              storePhone: values.storePhone ?? '',
              storeAddress: values.storeAddress ?? '',
            })
          }
          isSubmitting={saveMutation.isPending}
        />
      )}
    </div>
  )
}
