import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as newsletterService from '../services/newsletter.service'
import type { ListSubscribersParams } from '../services/newsletter.service'
import { toast } from '../lib/toast'

const key = ['newsletter-subscribers'] as const

export function useNewsletterSubscribers(params: ListSubscribersParams) {
  return useQuery({
    queryKey: [...key, params],
    queryFn: () => newsletterService.listSubscribers(params),
    placeholderData: (prev) => prev,
  })
}

export function useDeleteSubscriber() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => newsletterService.deleteSubscriber(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key })
      toast.success('Subscriber removed')
    },
    onError: (error) => toast.fromError(error),
  })
}

const campaignsKey = ['newsletter-campaigns'] as const

export function useCampaigns() {
  return useQuery({
    queryKey: campaignsKey,
    queryFn: () => newsletterService.listCampaigns(),
  })
}

export function useCreateCampaign() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: newsletterService.CreateCampaignInput) => newsletterService.createCampaign(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: campaignsKey })
      toast.success(variables.sendNow ? 'Newsletter sent' : 'Newsletter scheduled')
    },
    onError: (error) => toast.fromError(error),
  })
}
