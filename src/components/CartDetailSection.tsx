import { useEffect, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Notification03Icon, PackageIcon, ShoppingBag01Icon } from '@hugeicons/core-free-icons'
import { Button } from './Button'
import { ColorSwatch } from './ColorSwatch'
import { Input } from './Input'
import { Textarea } from './Textarea'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate } from '../utils/formatDate'
import type { CustomerCart } from '../services/customer.service'

export interface CartReminderInput {
  title: string
  body: string
}

interface CartDetailSectionProps {
  cart: CustomerCart | undefined
  isLoading: boolean
  customerName: string
  onSendReminder: (input: CartReminderInput) => void
  isSending: boolean
}

export function CartDetailSection({ cart, isLoading, customerName, onSendReminder, isSending }: CartDetailSectionProps) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  // Pre-fill a customer-name-aware default the moment the cart loads, but
  // never stomp on anything the admin has already typed — each field only
  // gets a default while it's still empty.
  useEffect(() => {
    if (!cart || cart.items.length === 0) return
    const firstName = customerName.split(' ')[0] || customerName
    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0)
    setTitle((prev) => prev || `Hey ${firstName}, you left something behind!`)
    setBody(
      (prev) =>
        prev ||
        `${firstName}, you have ${itemCount} item${itemCount === 1 ? '' : 's'} worth ${formatCurrency(
          cart.summary.total
        )} waiting in your cart. Complete your order before they sell out!`
    )
  }, [cart, customerName])

  return (
    <div className="py-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-medium text-black/50 dark:text-white/50">
          <HugeiconsIcon icon={ShoppingBag01Icon} size={15} />
          Current Cart
        </span>
        {cart?.lastActivityAt && (
          <span className="text-xs text-black/40 dark:text-white/40">
            Last touched {formatDate(cart.lastActivityAt)}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-black/5 dark:bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : !cart || cart.items.length === 0 ? (
        <p className="text-xs text-black/40 dark:text-white/40">Cart is empty.</p>
      ) : (
        <>
          <div className="divide-y divide-black/5 dark:divide-white/5">
            {cart.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-black/10 bg-gray-100 dark:border-white/10 dark:bg-gray-800">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-black/20 dark:text-white/20">
                      <HugeiconsIcon icon={PackageIcon} size={16} />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-black dark:text-white text-xs">{item.name}</p>
                  <div className="flex items-center gap-1.5 text-xs text-black/50 dark:text-white/50 mt-0.5">
                    {item.color.hex && <ColorSwatch hexCode={item.color.hex} name={item.color.name} />}
                    <span>{item.color.name}</span>
                    <span>•</span>
                    <span>{item.size}</span>
                    <span className="font-bold text-black dark:text-white">(x{item.quantity})</span>
                  </div>
                </div>
                <span className="shrink-0 font-bold text-black dark:text-white text-xs">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-1 text-xs font-bold text-black dark:text-white">
            <span>Cart Total</span>
            <span>{formatCurrency(cart.summary.total)}</span>
          </div>

          <div className="space-y-2.5 pt-2">
            <Input
              label="Notification Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
            <Textarea
              label="Message"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <Button
              variant="secondary"
              className="w-full justify-center"
              disabled={isSending || !title.trim() || !body.trim()}
              onClick={() => onSendReminder({ title: title.trim(), body: body.trim() })}
            >
              <HugeiconsIcon icon={Notification03Icon} size={16} />
              {isSending ? 'Sending…' : 'Send Cart Reminder'}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
