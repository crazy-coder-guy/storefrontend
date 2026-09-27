import { useQuery } from '@tanstack/react-query'
import * as cartService from '../services/cart.service'
import type { ListCartsParams } from '../services/cart.service'

const key = ['carts'] as const

export function useAbandonedCarts(params: ListCartsParams) {
  return useQuery({
    queryKey: [...key, params],
    queryFn: () => cartService.listAbandonedCarts(params),
    placeholderData: (prev) => prev,
  })
}
