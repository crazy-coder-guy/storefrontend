import { useQuery } from '@tanstack/react-query'
import * as categoryService from '../../../services/category.service'

// Fetches a single page large enough to cover the admin's category list for use in dropdowns.
export function useAllCategories() {
  return useQuery({
    queryKey: ['categories', 'all'],
    queryFn: () => categoryService.listCategories({ page: 1, limit: 100, status: 'ACTIVE' }),
  })
}
