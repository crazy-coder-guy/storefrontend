import { api } from './api'
import type { PaginatedResponse } from '../types'

export interface NewsletterSubscriber {
  id: string
  email: string
  createdAt: string
}

export interface ListSubscribersParams {
  page?: number
  limit?: number
}

export async function listSubscribers(params: ListSubscribersParams) {
  const { data } = await api.get<PaginatedResponse<NewsletterSubscriber>>('/newsletter/subscribers', { params })
  return data
}

export async function deleteSubscriber(id: string) {
  await api.delete(`/newsletter/subscribers/${id}`)
}

export interface Campaign {
  id: number
  name: string
  subject: string
  status: string
  createdAt: string
  sentDate: string | null
  statistics?: { globalStats?: { sent?: number; delivered?: number; opens?: number; clicks?: number } }
}

export interface CreateCampaignInput {
  subject: string
  htmlContent: string
  sendNow: boolean
  scheduledAt?: string
}

export async function listCampaigns() {
  const { data } = await api.get<{ campaigns: Campaign[] }>('/newsletter/campaigns')
  return data.campaigns
}

export async function createCampaign(input: CreateCampaignInput) {
  const { data } = await api.post('/newsletter/campaigns', input)
  return data
}
