import { useQuery } from '@tanstack/react-query'
import * as searchService from '../../../services/search.service'
import type { TopSearchesParams } from '../../../services/search.service'

export function useTopSearches(params: TopSearchesParams) {
  return useQuery({
    queryKey: ['search', 'top', params],
    queryFn: () => searchService.getTopSearches(params),
  })
}
