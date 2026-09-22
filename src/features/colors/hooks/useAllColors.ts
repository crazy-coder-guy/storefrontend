import { useQuery } from '@tanstack/react-query'
import * as colorService from '../../../services/color.service'

export function useAllColors() {
  return useQuery({
    queryKey: ['colors', 'all'],
    queryFn: () => colorService.listColors({ page: 1, limit: 100, status: 'ACTIVE' }),
  })
}
