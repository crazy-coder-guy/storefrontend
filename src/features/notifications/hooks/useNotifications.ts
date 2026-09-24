import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as pushService from '../../../services/push.service'
import type { CreateTemplateInput, SendNotificationInput } from '../../../services/push.service'
import { toast } from '../../../lib/toast'

const key = ['push-notifications'] as const
const templatesKey = ['push-templates'] as const

export function useSubscriberCount() {
  return useQuery({
    queryKey: ['push-subscriber-count'],
    queryFn: () => pushService.getSubscriberCount(),
  })
}

export function useSubscribers() {
  return useQuery({
    queryKey: ['push-subscribers'],
    queryFn: () => pushService.listSubscribers(),
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

export function useTemplates() {
  return useQuery({
    queryKey: templatesKey,
    queryFn: () => pushService.listTemplates(),
  })
}

export function useCreateTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateTemplateInput) => pushService.createTemplate(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templatesKey })
      toast.success('Template saved')
    },
    onError: (error) => toast.fromError(error),
  })
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => pushService.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templatesKey })
      toast.success('Template deleted')
    },
    onError: (error) => toast.fromError(error),
  })
}
