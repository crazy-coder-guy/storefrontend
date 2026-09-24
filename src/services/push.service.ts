import { api } from './api'
import type { PaginatedResponse } from '../types'

export interface PushNotification {
  id: string
  title: string
  body: string
  url: string | null
  successCount: number
  failureCount: number
  createdAt: string
}

export interface SendNotificationInput {
  title: string
  body: string
  url?: string
}

export async function sendNotification(input: SendNotificationInput) {
  const { data } = await api.post<PushNotification>('/push/notifications', input)
  return data
}

export async function listNotifications(page: number, limit = 20) {
  const { data } = await api.get<PaginatedResponse<PushNotification>>('/push/notifications', {
    params: { page, limit },
  })
  return data
}

export async function getSubscriberCount() {
  const { data } = await api.get<{ count: number }>('/push/subscriber-count')
  return data.count
}
