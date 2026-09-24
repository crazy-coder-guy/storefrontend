import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as pushService from '../../../services/push.service'
import type { SendNotificationInput } from '../../../services/push.service'
import { toast } from '../../../lib/toast'

const key = ['push-notifications'] as const

export function useNotificationHistory(page: number) {
  return useQuery({
    queryKey: [...key, page],
    queryFn: () => pushService.listNotifications(page),
    placeholderData: (prev) => prev,
  })
}

export function useSubscriberCount() {
  return useQuery({
    queryKey: ['push-subscriber-count'],
    queryFn: () => pushService.getSubscriberCount(),
  })
}

export function useSendNotification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: SendNotificationInput) => pushService.sendNotification(input),
    onSuccess: (record) => {
      queryClient.invalidateQueries({ queryKey: key })
      toast.success(`Sent to ${record.successCount} subscriber${record.successCount === 1 ? '' : 's'}`)
    },
    onError: (error) => toast.fromError(error),
  })
}
