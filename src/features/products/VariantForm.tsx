import { useEffect, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { HugeiconsIcon } from '@hugeicons/react'
import { Cancel01Icon, Upload01Icon } from '@hugeicons/core-free-icons'
import { Input } from '../../components/Input'
import { Select } from '../../components/Select'
import { Button } from '../../components/Button'
import { useAllColors } from '../colors/hooks/useAllColors'
import { useAllSizes } from '../sizes/hooks/useAllSizes'
import type { ProductImage, ProductVariant } from '../../types'

const schema = z.object({
  colorId: z.string().min(1, 'Color is required'),
  sizeId: z.string().min(1, 'Size is required'),
  sku: z.string().optional(),
  price: z
    .string()
    .optional()
    .refine((v) => !v || (!Number.isNaN(Number(v)) && Number(v) > 0), {
      message: 'Price must be greater than 0',
    }),
  stockQuantity: z.coerce.number().int().min(0).default(0),
})

export type VariantFormValues = z.output<typeof schema>

// The 4 shots a color needs — collected once per color (at whichever variant
// first introduces it), not per size, since every size in a color shares the
// same garment photos.
export const COLOR_IMAGE_SLOTS = [
  { key: 'hero', label: 'Thumbnail / Hero', hint: 'Full front view — clean, centered, entire garment visible' },
  { key: 'back', label: 'Back View', hint: 'Full back view — hood, back print/logo, length' },
  { key: 'side', label: 'Side View', hint: '45° / side view — shows the fit and silhouette' },
  { key: 'detail', label: 'Detail View', hint: 'Close-up of fabric, stitching, print/embroidery' },
] as const

export type ColorImageSlotKey = (typeof COLOR_IMAGE_SLOTS)[number]['key']
export type ColorImageFiles = Partial<Record<ColorImageSlotKey, File>>

interface VariantFormProps {
  initialValues?: ProductVariant
  /** Every image this product already has — used to tell whether the
   *  selected color still needs its photos collected. */
  existingImages: ProductImage[]
  onSubmit: (values: VariantFormValues, colorImages: ColorImageFiles) => void
  isSubmitting?: boolean
  onCancel: () => void
}

export function VariantForm({ initialValues, existingImages, onSubmit, isSubmitting, onCancel }: VariantFormProps) {
  const { data: colorsData, isLoading: colorsLoading } = useAllColors()
  const { data: sizesData, isLoading: sizesLoading } = useAllSizes()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      colorId: initialValues?.colorId ?? '',
      sizeId: initialValues?.sizeId ?? '',
      sku: initialValues?.sku ?? '',
      price: initialValues?.price != null ? String(initialValues.price) : '',
      stockQuantity: initialValues?.stockQuantity ?? 0,
    },
  })

  const selectedColorId = watch('colorId')
  const selectedColor = colorsData?.items.find((color) => color.id === selectedColorId)
  const colorNeedsImages = Boolean(selectedColorId) && !existingImages.some((img) => img.colorId === selectedColorId)

  const [colorImages, setColorImages] = useState<ColorImageFiles>({})
  const [previews, setPreviews] = useState<Partial<Record<ColorImageSlotKey, string>>>({})

  useEffect(() => {
    return () => {
      Object.values(previews).forEach((url) => url && URL.revokeObjectURL(url))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function setSlotFile(slot: ColorImageSlotKey, file: File | null) {
    setColorImages((prev) => ({ ...prev, [slot]: file ?? undefined }))
    setPreviews((prev) => {
      if (prev[slot]) URL.revokeObjectURL(prev[slot]!)
      return { ...prev, [slot]: file ? URL.createObjectURL(file) : undefined }
    })
  }

  return (
    <form
      onSubmit={handleSubmit((values) => onSubmit(values, colorNeedsImages ? colorImages : {}))}
      className="flex flex-col gap-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="colorId" className="text-sm font-medium text-black/80 dark:text-white/80">
            Color
          </label>
          <div className="relative">
            <Select
              id="colorId"
              {...register('colorId')}
              error={errors.colorId?.message}
              className={selectedColor ? 'pl-8' : undefined}
            >
              <option value="">{colorsLoading ? 'Loading…' : 'Select a color'}</option>
              {colorsData?.items.map((color) => (
                <option key={color.id} value={color.id} style={{ backgroundColor: color.hexCode }}>
                  ⬤ {color.name}
                </option>
              ))}
            </Select>
            {selectedColor && (
              <span
                className="pointer-events-none absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border border-black/15 dark:border-white/20"
                style={{ backgroundColor: selectedColor.hexCode }}
              />
            )}
          </div>
        </div>
        <Select label="Size" {...register('sizeId')} error={errors.sizeId?.message}>
          <option value="">{sizesLoading ? 'Loading…' : 'Select a size'}</option>
          {sizesData?.items.map((size) => (
            <option key={size.id} value={size.id}>
              {size.code}
            </option>
          ))}
        </Select>
      </div>

      <Input
        label="SKU"
        hint="Leave blank to auto-generate."
        {...register('sku')}
        error={errors.sku?.message}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Price override"
          type="number"
          step="0.01"
          hint="Leave blank to use the product's base price."
          {...register('price')}
          error={errors.price?.message}
        />
        <Input
          label="Stock Quantity"
          type="number"
          {...register('stockQuantity')}
          error={errors.stockQuantity?.message}
        />
      </div>

      {colorNeedsImages && (
        <div className="flex flex-col gap-3 rounded-xl border border-black/10 bg-gray-50 p-3.5 dark:border-white/10 dark:bg-white/5">
          <div>
            <p className="text-xs font-bold text-black dark:text-white">
              {selectedColor?.name} doesn't have photos yet
            </p>
            <p className="text-[11px] text-black/50 dark:text-white/50">
              These 4 shots cover this color for every size — you won't be asked again for this color.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {COLOR_IMAGE_SLOTS.map((slot) => (
              <ImageSlot
                key={slot.key}
                label={slot.label}
                hint={slot.hint}
                previewUrl={previews[slot.key]}
                onSelect={(file) => setSlotFile(slot.key, file)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : initialValues ? 'Save changes' : 'Add variant'}
        </Button>
      </div>
    </form>
  )
}

function ImageSlot({
  label,
  hint,
  previewUrl,
  onSelect,
}: {
  label: string
  hint: string
  previewUrl?: string
  onSelect: (file: File | null) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex flex-col gap-1">
      <div
        onClick={() => inputRef.current?.click()}
        title={hint}
        className="relative flex aspect-square cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed border-black/15 bg-white text-center hover:border-black/35 dark:border-white/15 dark:bg-black dark:hover:border-white/35"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onSelect(e.target.files?.[0] ?? null)}
        />
        {previewUrl ? (
          <>
            <img src={previewUrl} alt={label} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onSelect(null)
                if (inputRef.current) inputRef.current.value = ''
              }}
              className="absolute right-1 top-1 rounded-md bg-black/80 p-1 text-white hover:bg-black dark:bg-white/90 dark:text-black"
              aria-label={`Remove ${label}`}
            >
              <HugeiconsIcon icon={Cancel01Icon} size={12} />
            </button>
          </>
        ) : (
          <HugeiconsIcon icon={Upload01Icon} size={16} className="text-black/30 dark:text-white/30" />
        )}
      </div>
      <span className="text-center text-[10px] font-semibold leading-tight text-black/60 dark:text-white/60">
        {label}
      </span>
    </div>
  )
}
