import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as exchangeService from '../services/exchange.service'
import type { ListExchangesParams, ExchangeStatus } from '../services/exchange.service'
import { toast } from '../lib/toast'

const key = ['exchanges'] as const

export function useExchanges(params: ListExchangesParams) {
  return useQuery({
    queryKey: [...key, params],
    queryFn: () => exchangeService.listExchanges(params),
    placeholderData: (prev) => prev,
  })
}

export function useUpdateExchangeStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status, adminNote }: { id: string; status: ExchangeStatus; adminNote?: string }) =>
      exchangeService.updateExchangeStatus(id, status, adminNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key })
      toast.success('Exchange request updated')
    },
    onError: (error) => toast.fromError(error),
  })
}
