import { api } from './api'
import type { PaginatedResponse } from '../types'

export interface NotificationAction {
  action: string
  title: string
  icon?: string
  url?: string
}

export interface PushNotification {
  id: string
  title: string
  body: string
  url: string | null
  image: string | null
  actions: NotificationAction[] | null
  targetUserId: string | null
  successCount: number
  failureCount: number
  createdAt: string
}

export interface SendNotificationInput {
  title: string
  body: string
  url?: string
  image?: string
  actions?: NotificationAction[]
  userId?: string
}

export interface Subscriber {
  id: string
  name: string | null
  email: string
  photoUrl: string | null
}

export interface NotificationTemplate {
  id: string
  name: string
  title: string
  body: string
  url: string | null
  image: string | null
  actions: NotificationAction[] | null
  createdAt: string
  updatedAt: string
}

export interface CreateTemplateInput {
  name: string
  title: string
  body: string
  url?: string
  image?: string
  actions?: NotificationAction[]
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

export async function listSubscribers() {
  const { data } = await api.get<Subscriber[]>('/push/subscribers')
  return data
}

export async function listTemplates() {
  const { data } = await api.get<NotificationTemplate[]>('/push/templates')
  return data
}

export async function createTemplate(input: CreateTemplateInput) {
  const { data } = await api.post<NotificationTemplate>('/push/templates', input)
  return data
}

export async function deleteTemplate(id: string) {
  await api.delete(`/push/templates/${id}`)
}
