import { useEffect, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Cancel01Icon,
  Image01Icon,
  StarIcon,
  Upload01Icon,
} from '@hugeicons/core-free-icons'
import { Input } from '../../components/Input'
import { Select } from '../../components/Select'
import { Button } from '../../components/Button'
import { useAllColors } from '../colors/hooks/useAllColors'
import { useAllSizes } from '../sizes/hooks/useAllSizes'
import type { ProductImage, ProductVariant } from '../../types'

const schema = z.object({
  colorId: z.string().optional(),
  sizeId: z.string().min(1, 'Size is required'),
  sku: z.string().optional(),
  price: z
    .string()
    .optional()
    .refine((v) => !v || (!Number.isNaN(Number(v)) && Number(v) > 0), {
      message: 'Price must be greater than 0',
    }),
  stockQuantity: z.coerce.number().int().min(0).default(0),
  // Garment measurements (inches, optional)
  chestWidth: z.coerce.number().nonnegative().optional().or(z.literal('')),
  bodyLength: z.coerce.number().nonnegative().optional().or(z.literal('')),
  sleeveLength: z.coerce.number().nonnegative().optional().or(z.literal('')),
  shoulderWidth: z.coerce.number().nonnegative().optional().or(z.literal('')),
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
  existingImages: ProductImage[]
  onSubmit: (
    values: VariantFormValues,
    colorImages: ColorImageFiles,
    replacedImageIds?: Partial<Record<ColorImageSlotKey, string>>,
    deletedImageIds?: string[]
  ) => void
  isSubmitting?: boolean
  onCancel: () => void
  onOpenPhotosModal?: () => void
}

export function VariantForm({
  initialValues,
  existingImages,
  onSubmit,
  isSubmitting,
  onCancel,
  onOpenPhotosModal,
}: VariantFormProps) {
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
      chestWidth: initialValues?.chestWidth ?? '',
      bodyLength: initialValues?.bodyLength ?? '',
      sleeveLength: initialValues?.sleeveLength ?? '',
      shoulderWidth: initialValues?.shoulderWidth ?? '',
    },
  })

  const selectedColorId = watch('colorId')
  const selectedColor = colorsData?.items.find((color) => color.id === selectedColorId)

  // Images in DB for the currently selected color (or universal if no color)
  const currentColorImages = existingImages
    .filter((img) => (selectedColorId ? img.colorId === selectedColorId : !img.colorId))
    .sort((a, b) => a.sortOrder - b.sortOrder)

  function getSlotExistingImage(index: number): ProductImage | undefined {
    const byOrder = currentColorImages.find((img) => img.sortOrder === index)
    if (byOrder) return byOrder
    const hasAnyStrictOrder = currentColorImages.some((img) => img.sortOrder < 4)
    if (!hasAnyStrictOrder && currentColorImages[index]) {
      return currentColorImages[index]
    }
    return undefined
  }

  const [colorImages, setColorImages] = useState<ColorImageFiles>({})
  const [previews, setPreviews] = useState<Partial<Record<ColorImageSlotKey, string>>>({})
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([])

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

  function handleRemoveExistingImage(imageId: string) {
    setDeletedImageIds((prev) => (prev.includes(imageId) ? prev : [...prev, imageId]))
  }

  function handleUndoRemoveExistingImage(imageId: string) {
    setDeletedImageIds((prev) => prev.filter((id) => id !== imageId))
  }

  function handleFormSubmit(values: VariantFormValues) {
    const replacedImageIds: Partial<Record<ColorImageSlotKey, string>> = {}
    COLOR_IMAGE_SLOTS.forEach((slot, index) => {
      const existingImg = getSlotExistingImage(index)
      if (colorImages[slot.key] && existingImg && !deletedImageIds.includes(existingImg.id)) {
        replacedImageIds[slot.key] = existingImg.id
      }
    })

    onSubmit(values, colorImages, replacedImageIds, deletedImageIds)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="colorId" className="text-sm font-medium text-black/80 dark:text-white/80">
            Color <span className="text-xs font-normal text-black/40 dark:text-white/40">(Optional)</span>
          </label>
          <div className="relative">
            <Select
              id="colorId"
              {...register('colorId')}
              error={errors.colorId?.message}
              className={selectedColor ? 'pl-8' : undefined}
            >
              <option value="">{colorsLoading ? 'Loading…' : 'No Color (Universal)'}</option>
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

      {/* Garment Measurements */}
      <div className="flex flex-col gap-1.5 rounded-xl border border-black/10 bg-gray-50 p-3.5 dark:border-white/10 dark:bg-white/5">
        <p className="text-xs font-bold text-black dark:text-white">
          Measurements <span className="font-normal text-black/40 dark:text-white/40">(inches — optional)</span>
        </p>
        <p className="text-[11px] text-black/50 dark:text-white/50 mb-1">
          These measurements are specific to this size variant. Leave blank if you don't have exact data yet.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Input
            label="Chest Width"
            type="number"
            step="0.5"
            placeholder="e.g. 20"
            hint="Across chest (in)"
            {...register('chestWidth')}
            error={(errors as Record<string, { message?: string }>).chestWidth?.message}
          />
          <Input
            label="Body Length"
            type="number"
            step="0.5"
            placeholder="e.g. 28"
            hint="Top to hem (in)"
            {...register('bodyLength')}
            error={(errors as Record<string, { message?: string }>).bodyLength?.message}
          />
          <Input
            label="Shoulder Length"
            type="number"
            step="0.5"
            placeholder="e.g. 18"
            hint="Shoulder width (in)"
            {...register('shoulderWidth')}
            error={(errors as Record<string, { message?: string }>).shoulderWidth?.message}
          />
          <Input
            label="Sleeve Length"
            type="number"
            step="0.5"
            placeholder="e.g. 9"
            hint="Shoulder to cuff (in)"
            {...register('sleeveLength')}
            error={(errors as Record<string, { message?: string }>).sleeveLength?.message}
          />
        </div>
      </div>

      {/* Photos Section — Always accessible to view, edit, replace or upload photos */}
      <div className="flex flex-col gap-3 rounded-xl border border-black/10 bg-gray-50 p-3.5 dark:border-white/10 dark:bg-white/5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-bold text-black dark:text-white">
              {selectedColor ? `${selectedColor.name} Photos` : 'Product Photos (Universal)'}
            </p>
            <p className="text-[11px] text-black/50 dark:text-white/50">
              {currentColorImages.length > 0
                ? `${currentColorImages.length} photo(s) currently linked. You can replace or update photos below.`
                : 'Upload photos for this garment color. Photos are shared across all sizes in this color.'}
            </p>
          </div>
          {onOpenPhotosModal && (
            <Button
              type="button"
              variant="secondary"
              className="px-2.5 py-1 text-xs shrink-0"
              onClick={onOpenPhotosModal}
            >
              <HugeiconsIcon icon={Image01Icon} size={14} />
              Full Photo Editor
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {COLOR_IMAGE_SLOTS.map((slot, index) => {
            const existingImg = getSlotExistingImage(index)
            const isDeleted = existingImg ? deletedImageIds.includes(existingImg.id) : false
            const previewUrl = previews[slot.key]

            return (
              <FormSlotItem
                key={slot.key}
                label={slot.label}
                hint={slot.hint}
                existingImage={isDeleted ? undefined : existingImg}
                wasMarkedDeleted={isDeleted}
                newFilePreview={previewUrl}
                onSelectFile={(file) => setSlotFile(slot.key, file)}
                onClearNewFile={() => setSlotFile(slot.key, null)}
                onRemoveExisting={() => existingImg && handleRemoveExistingImage(existingImg.id)}
                onRestoreExisting={() => existingImg && handleUndoRemoveExistingImage(existingImg.id)}
              />
            )
          })}
        </div>
      </div>

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

interface FormSlotItemProps {
  label: string
  hint: string
  existingImage?: ProductImage
  wasMarkedDeleted: boolean
  newFilePreview?: string
  onSelectFile: (file: File | null) => void
  onClearNewFile: () => void
  onRemoveExisting: () => void
  onRestoreExisting: () => void
}

function FormSlotItem({
  label,
  hint,
  existingImage,
  wasMarkedDeleted,
  newFilePreview,
  onSelectFile,
  onClearNewFile,
  onRemoveExisting,
  onRestoreExisting,
}: FormSlotItemProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex flex-col gap-1.5">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onSelectFile(e.target.files?.[0] ?? null)}
      />

      <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-dashed border-black/15 bg-white dark:border-white/15 dark:bg-black">
        {/* Case 1: New file chosen (either replacement or new upload) */}
        {newFilePreview ? (
          <>
            <img src={newFilePreview} alt={label} className="h-full w-full object-cover" />
            <span className="absolute left-1 top-1 rounded bg-emerald-600/90 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-xs">
              {existingImage ? 'Replacement' : 'New'}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onClearNewFile()
                if (inputRef.current) inputRef.current.value = ''
              }}
              className="absolute right-1 top-1 rounded-md bg-black/80 p-1 text-white hover:bg-black dark:bg-white/90 dark:text-black cursor-pointer shadow-xs"
              title="Cancel new file"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={12} />
            </button>
          </>
        ) : existingImage ? (
          /* Case 2: Existing photo in DB */
          <div className="group relative h-full w-full">
            <img src={existingImage.imageUrl} alt={label} className="h-full w-full object-cover" />
            {existingImage.isPrimary && (
              <span className="absolute left-1 top-1 flex items-center gap-0.5 rounded bg-amber-500/90 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-xs">
                <HugeiconsIcon icon={StarIcon} size={9} />
                Hero
              </span>
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/60 p-2 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="rounded-md bg-white px-2 py-1 text-[10px] font-bold text-black hover:bg-gray-100 cursor-pointer shadow-xs"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={onRemoveExisting}
                className="rounded-md bg-rose-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-rose-700 cursor-pointer shadow-xs"
              >
                Delete
              </button>
            </div>
          </div>
        ) : wasMarkedDeleted ? (
          /* Case 3: Marked deleted */
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-2 text-center bg-rose-50/50 dark:bg-rose-950/20">
            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">Marked for delete</span>
            <button
              type="button"
              onClick={onRestoreExisting}
              className="rounded bg-black/10 px-2 py-0.5 text-[9px] font-medium text-black hover:bg-black/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 cursor-pointer"
            >
              Undo
            </button>
          </div>
        ) : (
          /* Case 4: Empty slot */
          <div
            onClick={() => inputRef.current?.click()}
            title={hint}
            className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-1 text-center hover:border-black/35 dark:hover:border-white/35 transition-colors p-2"
          >
            <HugeiconsIcon icon={Upload01Icon} size={16} className="text-black/30 dark:text-white/30" />
            <span className="text-[10px] text-black/50 dark:text-white/50">Upload</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-center">
        <span className="truncate text-[10px] font-semibold text-black/70 dark:text-white/70" title={label}>
          {label}
        </span>
        {existingImage && !newFilePreview && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-[10px] text-blue-600 hover:underline dark:text-blue-400 cursor-pointer"
          >
            Replace
          </button>
        )}
      </div>
    </div>
  )
}
