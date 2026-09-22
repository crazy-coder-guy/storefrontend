import { PageHeader } from '../components/PageHeader'
import { ThemeSettings } from '../features/settings/ThemeSettings'

export function SettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" description="Admin preferences for this device." />
      <ThemeSettings />
    </div>
  )
}
