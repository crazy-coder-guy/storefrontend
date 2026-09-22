import { HugeiconsIcon } from '@hugeicons/react'
import {
  ShoppingBag01Icon,
  FavouriteIcon,
  Search01Icon,
  Menu01Icon,
  Image01Icon,
  Tick01Icon,
} from '@hugeicons/core-free-icons'
import { formatCurrency } from '../utils/formatCurrency'

export interface MobileStorePreviewProps {
  name?: string
  categoryName?: string
  basePrice?: number
  mrp?: number
  imageUrl?: string | null
  description?: string
  productType?: string
  status?: string
}

export function MobileStorePreview({
  name = 'Product Title',
  categoryName = 'Category',
  basePrice = 0,
  mrp = 0,
  imageUrl,
  description,
  productType,
  status = 'DRAFT',
}: MobileStorePreviewProps) {
  const discountPercent =
    mrp > 0 && basePrice > 0 && mrp > basePrice ? Math.round(((mrp - basePrice) / mrp) * 100) : 0

  return (
    <div className="flex flex-col items-center">
      {/* Label / Status Header */}
      <div className="mb-3 flex items-center justify-between w-full max-w-[340px] px-1">
        <span className="text-xs font-bold uppercase tracking-wider text-black/50 dark:text-white/50">
          Live Storefront Preview
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${status === 'ACTIVE'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'bg-black/10 text-black/70 dark:bg-white/10 dark:text-white/70'
            }`}
        >
          {status}
        </span>
      </div>

      {/* Smartphone Mockup Container */}
      <div className="relative h-[620px] w-[320px] sm:w-[340px] flex-col overflow-hidden rounded-[40px] border-[10px] border-black bg-white shadow-2xl transition-all dark:border-gray-800 dark:bg-black">
        {/* Dynamic Island / Speaker Notch */}
        <div className="absolute left-1/2 top-2 z-30 h-4 w-28 -translate-x-1/2 rounded-full bg-black dark:bg-gray-900" />

        {/* Mobile App Navigation Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-black/5 bg-white/90 px-4 pb-2.5 pt-8 backdrop-blur-md dark:border-white/5 dark:bg-black/90">
          <div className="flex items-center gap-2">
            <button type="button" className="text-black dark:text-white">
              <HugeiconsIcon icon={Menu01Icon} size={18} />
            </button>
            <span className="text-xs font-black tracking-widest text-black dark:text-white">
              STORE
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button type="button" className="text-black dark:text-white">
              <HugeiconsIcon icon={Search01Icon} size={18} />
            </button>
            <div className="relative text-black dark:text-white">
              <HugeiconsIcon icon={ShoppingBag01Icon} size={18} />
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[9px] font-bold text-white dark:bg-white dark:text-black">
                1
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Product Mobile Body */}
        <div className="flex-1 overflow-y-auto pb-20 no-scrollbar">
          {/* Main Product Hero Image */}
          <div className="relative aspect-square w-full overflow-hidden bg-gray-100 dark:bg-gray-900">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={name}
                className="h-full w-full object-cover transition-transform duration-300"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center text-black/30 dark:text-white/30">
                <HugeiconsIcon icon={Image01Icon} size={36} />
                <span className="mt-2 text-[11px]">Upload Image</span>
              </div>
            )}
            <button
              type="button"
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-black shadow-xs backdrop-blur-xs dark:bg-black/80 dark:text-white"
            >
              <HugeiconsIcon icon={FavouriteIcon} size={16} />
            </button>
          </div>

          {/* Product Meta Section */}
          <div className="p-4">
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-black/5 px-2 py-0.5 text-[10px] font-semibold text-black/70 dark:bg-white/10 dark:text-white/70">
                {categoryName || 'Category'}
              </span>
              {productType && (
                <span className="text-[10px] text-black/40 dark:text-white/40">{productType}</span>
              )}
            </div>

            <h1 className="mt-2 text-base font-bold leading-snug text-black dark:text-white">
              {name || 'Product Name'}
            </h1>

            {/* Pricing Section */}
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-lg font-black text-black dark:text-white">
                {basePrice > 0 ? formatCurrency(basePrice) : '₹0.00'}
              </span>
              {mrp > basePrice && (
                <>
                  <span className="text-xs text-black/40 line-through dark:text-white/40">
                    {formatCurrency(mrp)}
                  </span>
                  <span className="rounded bg-black px-1.5 py-0.5 text-[9px] font-bold text-white dark:bg-white dark:text-black">
                    {discountPercent}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Select Size Swatches Preview */}
            <div className="mt-4 border-t border-black/5 pt-3 dark:border-white/5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-black/50 dark:text-white/50">
                Select Size
              </p>
              <div className="mt-1.5 flex gap-1.5">
                {['S', 'M', 'L', 'XL'].map((size, idx) => (
                  <div
                    key={size}
                    className={`flex h-7 w-8 items-center justify-center rounded border text-xs font-semibold ${idx === 1
                        ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                        : 'border-black/10 text-black/70 dark:border-white/10 dark:text-white/70'
                      }`}
                  >
                    {size}
                  </div>
                ))}
              </div>
            </div>

            {/* Description Preview */}
            {description && (
              <div className="mt-4 border-t border-black/5 pt-3 dark:border-white/5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-black/50 dark:text-white/50">
                  Product Overview
                </p>
                <p className="mt-1 text-xs leading-relaxed text-black/70 line-clamp-3 dark:text-white/70">
                  {description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Sticky Add to Bag Footer Bar */}
        <div className="absolute bottom-0 left-0 right-0 z-20 border-t border-black/10 bg-white/95 p-3 backdrop-blur-md dark:border-white/10 dark:bg-black/95">
          <div className="flex gap-2">
            <button
              type="button"
              className="flex-1 rounded-xl bg-black py-2.5 text-center text-xs font-bold text-white shadow-xs dark:bg-white dark:text-black"
            >
              Add to Bag
            </button>
            <button
              type="button"
              className="flex items-center justify-center rounded-xl border border-black/15 bg-gray-50 px-3 py-2.5 text-black dark:border-white/20 dark:bg-gray-900 dark:text-white"
            >
              <HugeiconsIcon icon={Tick01Icon} size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
