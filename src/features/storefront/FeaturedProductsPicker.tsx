import { useEffect, useMemo, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Image01Icon } from '@hugeicons/core-free-icons'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { Skeleton } from '../../components/Skeleton'
import { EmptyState } from '../../components/EmptyState'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useProducts } from '../products/hooks/useProducts'
import { formatCurrency } from '../../utils/formatCurrency'
import { cn } from '../../utils/cn'
import type { FeaturedProduct } from '../../types'

interface FeaturedProductsPickerProps {
  featured: FeaturedProduct[]
  onSave: (productIds: string[]) => void
  isSubmitting?: boolean
  className?: string
}

export function FeaturedProductsPicker({ featured, onSave, isSubmitting, className }: FeaturedProductsPickerProps) {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    setSelected(featured.map((f) => f.productId))
  }, [featured])

  const { data, isLoading, isError } = useProducts({
    search: debouncedSearch || undefined,
    status: 'ACTIVE',
    limit: 100,
  })

  const products = data?.items ?? []
  const selectedSet = useMemo(() => new Set(selected), [selected])

  function toggle(productId: string) {
    setSelected((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    )
  }

  const isDirty =
    selected.length !== featured.length || selected.some((id) => !featured.some((f) => f.productId === id))

  return (
    <div className={cn('max-w-3xl rounded-xl border border-black/10 p-5 dark:border-white/10', className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Top selling products</h2>
          <p className="mt-1 text-sm text-black/50 dark:text-white/50">
            Choose which products appear in the storefront's "Top Selling" section. Select as many as you
            like — there's no limit.
          </p>
        </div>
        <span className="rounded-full border border-black/15 px-2.5 py-0.5 text-xs font-medium dark:border-white/20">
          {selected.length} selected
        </span>
      </div>

      <div className="mt-4">
        <Input
          label="Search products"
          placeholder="Type a product name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="mt-4 max-h-96 overflow-y-auto rounded-lg border border-black/10 dark:border-white/10">
        {isLoading ? (
          <div className="flex flex-col gap-3 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-4">
            <EmptyState title="Couldn't load products" description="Try again in a moment." />
          </div>
        ) : products.length === 0 ? (
          <div className="p-4">
            <EmptyState title="No products found" description="Try a different search." />
          </div>
        ) : (
          <ul className="divide-y divide-black/10 dark:divide-white/10">
            {products.map((product) => {
              const checked = selectedSet.has(product.id)
              const image = product.images?.find((img) => img.isPrimary) ?? product.images?.[0]
              return (
                <li key={product.id}>
                  <label
                    className={cn(
                      'flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors',
                      checked ? 'bg-black/5 dark:bg-white/10' : 'hover:bg-black/[0.02] dark:hover:bg-white/5'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(product.id)}
                      className="h-4 w-4 shrink-0 accent-black dark:accent-white"
                    />
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-black/5 dark:bg-white/10">
                      {image ? (
                        <img src={image.imageUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <HugeiconsIcon icon={Image01Icon} size={16} className="text-black/30 dark:text-white/30" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-black/50 dark:text-white/50">
                        {product.category?.name ?? product.productType}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-medium">{formatCurrency(product.basePrice)}</span>
                  </label>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div className="mt-4 flex justify-end">
        <Button disabled={isSubmitting || !isDirty} onClick={() => onSave(selected)}>
          {isSubmitting ? 'Saving…' : 'Save selection'}
        </Button>
      </div>
    </div>
  )
}
