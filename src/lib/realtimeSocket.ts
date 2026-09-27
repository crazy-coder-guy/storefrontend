import { io } from 'socket.io-client'

// Socket.IO connects to the bare origin — VITE_API_BASE_URL includes the
// REST path (…/api/v1), which the socket server doesn't use.
const origin = new URL(import.meta.env.VITE_API_BASE_URL).origin

export const realtimeSocket = io(origin, {
  autoConnect: true,
  transports: ['websocket', 'polling'],
})

export type RealtimeEntity =
  | 'product'
  | 'category'
  | 'color'
  | 'size'
  | 'inventory'
  | 'order'
  | 'review'
  | 'exchange'
  | 'newsletter'
  | 'storefront'
  | 'cart'

export interface RealtimeEvent {
  entity: RealtimeEntity
  action: 'created' | 'updated' | 'deleted'
  id?: string
  at: number
}
