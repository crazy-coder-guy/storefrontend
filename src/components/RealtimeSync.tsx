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
  cart: [['carts'], ['customers']],
}

export function RealtimeSync() {
  const queryClient = useQueryClient()

  useEffect(() => {
    // Debounced, not immediate: a burst of events (e.g. bulk-editing several
    // variants) would otherwise fire invalidateQueries once per event, each
    // restarting the same query's in-flight refetch — which can stack up to
    // several seconds before it finally settles. Coalescing everything
    // within a short window into one invalidate per key lets a burst
    // resolve about as fast as a single change does.
    const pendingKeys = new Map<string, string[]>()
    let timer: ReturnType<typeof setTimeout> | null = null

    function flush() {
      timer = null
      for (const queryKey of pendingKeys.values()) {
        queryClient.invalidateQueries({ queryKey })
      }
      pendingKeys.clear()
    }

    function handleEvent(event: RealtimeEvent) {
      const keys = ENTITY_QUERY_KEYS[event.entity]
      if (!keys) return
      for (const queryKey of keys) pendingKeys.set(JSON.stringify(queryKey), queryKey)
      if (!timer) timer = setTimeout(flush, 250)
    }

    realtimeSocket.on('realtime:event', handleEvent)
    return () => {
      realtimeSocket.off('realtime:event', handleEvent)
      if (timer) clearTimeout(timer)
    }
  }, [queryClient])

  return null
}
