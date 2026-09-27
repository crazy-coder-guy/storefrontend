import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { realtimeSocket, type RealtimeEvent } from '../lib/realtimeSocket'

// Coarse invalidation, not fine-grained cache patching: an entity change
// just tells every mounted query for that resource to refetch. Cheap
// (react-query only refetches queries currently in use) and far simpler
// than mirroring every service's serialization shape over the socket.
const ENTITY_QUERY_KEYS: Record<RealtimeEvent['entity'], string[][]> = {
  product: [['products'], ['dashboard-summary']],
  category: [['categories']],
  color: [['colors']],
  size: [['sizes']],
  inventory: [['inventory'], ['dashboard-summary']],
  order: [['orders'], ['customers'], ['dashboard-summary'], ['inventory']],
  review: [['reviews']],
  exchange: [['exchanges']],
  newsletter: [['newsletter-subscribers']],
  storefront: [['storefront']],
}

export function RealtimeSync() {
  const queryClient = useQueryClient()

  useEffect(() => {
    function handleEvent(event: RealtimeEvent) {
      const keys = ENTITY_QUERY_KEYS[event.entity]
      if (!keys) return
      for (const queryKey of keys) {
        queryClient.invalidateQueries({ queryKey })
      }
    }

    realtimeSocket.on('realtime:event', handleEvent)
    return () => {
      realtimeSocket.off('realtime:event', handleEvent)
    }
  }, [queryClient])

  return null
}
