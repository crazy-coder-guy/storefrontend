import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getSettings, saveSettings } from '../../../services/settings.service'
import type { AdminSettings } from '../../../types'
import { toast } from '../../../lib/toast'

export const settingsKey = ['settings'] as const

export function useSettings() {
  return useQuery({ queryKey: settingsKey, queryFn: getSettings })
}

export function useSaveSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (settings: AdminSettings) => saveSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKey })
      toast.success('Settings saved')
    },
    onError: (error) => toast.fromError(error),
  })
}
