import { api } from './api'
import type { Color, ColorInput, EntityStatus, PaginatedResponse } from '../types'

export interface ListColorsParams {
  status?: EntityStatus
  page?: number
  limit?: number
}

export async function listColors(params: ListColorsParams) {
  const { data } = await api.get<PaginatedResponse<Color>>('/colors', { params })
  return data
}

export async function createColor(input: ColorInput) {
  const { data } = await api.post<Color>('/colors', input)
  return data
}

export async function updateColor(id: string, input: Partial<ColorInput>) {
  const { data } = await api.patch<Color>(`/colors/${id}`, input)
  return data
}

export async function deleteColor(id: string) {
  const { data } = await api.delete<Color>(`/colors/${id}`)
  return data
}
