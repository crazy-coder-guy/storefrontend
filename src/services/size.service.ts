import { api } from './api'
import type { EntityStatus, PaginatedResponse, Size, SizeInput } from '../types'

export interface ListSizesParams {
  status?: EntityStatus
  page?: number
  limit?: number
}

export async function listSizes(params: ListSizesParams) {
  const { data } = await api.get<PaginatedResponse<Size>>('/sizes', { params })
  return data
}

export async function createSize(input: SizeInput) {
  const { data } = await api.post<Size>('/sizes', input)
  return data
}

export async function updateSize(id: string, input: Partial<SizeInput>) {
  const { data } = await api.patch<Size>(`/sizes/${id}`, input)
  return data
}

export async function deleteSize(id: string) {
  const { data } = await api.delete<Size>(`/sizes/${id}`)
  return data
}
