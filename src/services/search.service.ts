import { api } from './api'
import type { TopSearchTerm } from '../types'

export interface TopSearchesParams {
  days?: number
  limit?: number
}

export async function getTopSearches(params: TopSearchesParams = {}) {
  const { data } = await api.get<TopSearchTerm[]>('/search/top', { params })
  return data
}
