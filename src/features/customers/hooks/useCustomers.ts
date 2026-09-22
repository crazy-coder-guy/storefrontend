import { useQuery } from '@tanstack/react-query'
import * as customerService from '../../../services/customer.service'
import type { ListCustomersParams } from '../../../services/customer.service'

const listKey = ['customers'] as const

export function useCustomers(params: ListCustomersParams) {
  return useQuery({
    queryKey: [...listKey, params],
    queryFn: () => customerService.listCustomers(params),
    placeholderData: (prev) => prev,
  })
}
