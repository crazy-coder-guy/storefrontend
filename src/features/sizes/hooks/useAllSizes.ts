import { useQuery } from '@tanstack/react-query'
import * as sizeService from '../../../services/size.service'

export function useAllSizes() {
  return useQuery({
    queryKey: ['sizes', 'all'],
    queryFn: () => sizeService.listSizes({ page: 1, limit: 100, status: 'ACTIVE' }),
  })
}
