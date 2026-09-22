import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as orderService from '../../../services/order.service'
import type { ListOrdersParams } from '../../../services/order.service'
import type { OrderStatus } from '../../../types'
import { toast } from '../../../lib/toast'

const listKey = ['orders'] as const
const detailKey = (id: string) => ['orders', id] as const

export function useOrders(params: ListOrdersParams) {
  return useQuery({
    queryKey: [...listKey, params],
    queryFn: () => orderService.listOrders(params),
    placeholderData: (prev) => prev,
  })
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: detailKey(id ?? ''),
    queryFn: () => orderService.getOrder(id as string),
    enabled: !!id,
  })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      orderService.updateOrderStatus(id, status),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: listKey })
      queryClient.invalidateQueries({ queryKey: detailKey(id) })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
      toast.success('Order status updated')
    },
    onError: (error) => toast.fromError(error),
  })
}
