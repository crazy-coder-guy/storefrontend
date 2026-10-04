import { useRef, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Delete02Icon,
  StarIcon,
  Tick01Icon,
  Upload01Icon,
} from '@hugeicons/core-free-icons'
import { Modal } from '../../components/Modal'
import { Button } from '../../components/Button'
import { ColorSwatch } from '../../components/ColorSwatch'
import {
  useDeleteProductImage,
  useUpdateProductImage,
  useUploadProductImage,
} from './hooks/useProductImages'
import { COLOR_IMAGE_SLOTS, type ColorImageSlotKey } from './VariantForm'
import type { ProductImage, ProductVariant } from '../../types'
import { toast } from '../../lib/toast'

interface VariantPhotosModalProps {
  open: boolean
  onClose: () => void
  productId: string
  variant: ProductVariant | null
  existingImages: ProductImage[]
}

export function VariantPhotosModal({
  open,
  onClose,
  productId,
  variant,
  existingImages,
}: VariantPhotosModalProps) {
  const uploadImage = useUploadProductImage(productId)
  const deleteImage = useDeleteProductImage(productId)
  const updateImage = useUpdateProductImage(productId)

  const [activeSlotLoading, setActiveSlotLoading] = useState<string | null>(null)
  const [extraUploading, setExtraUploading] = useState(false)
  const extraFileInputRef = useRef<HTMLInputElement>(null)

  if (!variant) return null

  const colorId = variant.colorId ?? null
  const colorName = variant.color?.name ?? 'No Color (Universal)'
  const colorHex = variant.color?.hexCode

  // Filter all images belonging to this variant's color (or universal if no color)
  const variantImages = existingImages
    .filter((img) => (colorId ? img.colorId === colorId : !img.colorId))
    .sort((a, b) => a.sortOrder - b.sortOrder)

  // Find image for each of the 4 standard slots
  function getSlotImage(index: number): ProductImage | undefined {
    // Exact sortOrder match
    const byOrder = variantImages.find((img) => img.sortOrder === index)
    if (byOrder) return byOrder

    // If images exist without matching sortOrder, use by array position
    const hasAnyStrictOrder = variantImages.some((img) => img.sortOrder < 4)
    if (!hasAnyStrictOrder && variantImages[index]) {
      return variantImages[index]
    }

    return undefined
  }

  // Any images that don't belong to the 4 primary slots
  const primaryImageIds = new Set(
    COLOR_IMAGE_SLOTS.map((_, idx) => getSlotImage(idx)?.id).filter(Boolean)
  )
  const additionalImages = variantImages.filter((img) => !primaryImageIds.has(img.id))

  async function handleReplaceSlot(slotKey: ColorImageSlotKey, slotIndex: number, file: File, currentImageId: string) {
    setActiveSlotLoading(slotKey)
    try {
      const currentImage = variantImages.find((img) => img.id === currentImageId)
      const isPrimary = currentImage?.isPrimary ?? (slotIndex === 0)

      // Upload replacement image first
      await uploadImage.mutateAsync({
        file,
        colorId: colorId ?? undefined,
        sortOrder: slotIndex,
        isPrimary,
        imageType: 'PRODUCT',
      })

      // Once uploaded, delete the old image
      await deleteImage.mutateAsync(currentImageId)
      toast.success(`${COLOR_IMAGE_SLOTS[slotIndex].label} replaced successfully`)
    } catch {
      toast.error('Failed to replace photo')
    } finally {
      setActiveSlotLoading(null)
    }
  }

  async function handleUploadSlot(slotKey: ColorImageSlotKey, slotIndex: number, file: File) {
    setActiveSlotLoading(slotKey)
    try {
      const hasAnyPrimary = existingImages.some((i) => i.isPrimary)
      await uploadImage.mutateAsync({
        file,
        colorId: colorId ?? undefined,
        sortOrder: slotIndex,
        isPrimary: slotIndex === 0 && !hasAnyPrimary,
        imageType: 'PRODUCT',
      })
      toast.success(`${COLOR_IMAGE_SLOTS[slotIndex].label} uploaded successfully`)
    } catch {
      toast.error('Failed to upload photo')
    } finally {
      setActiveSlotLoading(null)
    }
  }

  async function handleDeleteImage(slotKey: string, imageId: string, label: string) {
    if (!window.confirm(`Are you sure you want to delete the ${label} photo?`)) return

    setActiveSlotLoading(slotKey)
    try {
      await deleteImage.mutateAsync(imageId)
      toast.success(`${label} deleted successfully`)
    } catch {
      toast.error('Failed to delete photo')
    } finally {
      setActiveSlotLoading(null)
    }
  }

  async function handleSetPrimary(slotKey: string, imageId: string) {
    setActiveSlotLoading(slotKey)
    try {
      await updateImage.mutateAsync({
        imageId,
        input: { isPrimary: true },
      })
      toast.success('Set as primary catalog photo')
    } catch {
      toast.error('Failed to set as primary photo')
    } finally {
      setActiveSlotLoading(null)
    }
  }

  async function handleUploadExtra(file: File) {
    setExtraUploading(true)
    try {
      await uploadImage.mutateAsync({
        file,
        colorId: colorId ?? undefined,
        sortOrder: 10 + additionalImages.length,
        isPrimary: false,
        imageType: 'PRODUCT',
      })
      toast.success('Additional photo uploaded successfully')
    } catch {
      toast.error('Failed to upload additional photo')
    } finally {
      setExtraUploading(false)
      if (extraFileInputRef.current) extraFileInputRef.current.value = ''
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Manage Variant Photos"
      widthClassName="max-w-3xl"
    >
      <div className="flex flex-col gap-5">
        {/* Variant summary pill & guidance */}
        <div className="flex flex-col gap-2 rounded-xl border border-black/10 bg-gray-50/70 p-3.5 sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center gap-2.5">
            <ColorSwatch hexCode={colorHex} name={colorName} />
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-semibold text-black dark:text-white">
                {colorName}
              </span>
              {variant.size && (
                <span className="rounded bg-black/10 px-1.5 py-0.5 text-[11px] font-bold text-black/70 dark:bg-white/10 dark:text-white/70">
                  Size {variant.size.code}
                </span>
              )}
              {variant.sku && (
                <span className="text-black/40 dark:text-white/40 font-mono">
                  • {variant.sku}
                </span>
              )}
            </div>
          </div>
          <div className="text-[11px] text-black/50 dark:text-white/50">
            {variantImages.length} photo{variantImages.length === 1 ? '' : 's'} linked to this color
          </div>
        </div>

        <div className="rounded-lg bg-blue-50/60 p-3 text-xs text-blue-900 border border-blue-200/50 dark:bg-blue-950/20 dark:text-blue-300 dark:border-blue-900/40">
          <span className="font-semibold">Photo Grouping:</span> Photos are shared across all sizes with the color{' '}
          <span className="font-bold">{colorName}</span>. Any changes here immediately update all variants of this color.
        </div>

        {/* 4 Standard Photo Slots */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {COLOR_IMAGE_SLOTS.map((slot, index) => {
            const slotImage = getSlotImage(index)
            const isLoading = activeSlotLoading === slot.key

            return (
              <PhotoSlotCard
                key={slot.key}
                slotKey={slot.key}
                index={index}
                label={slot.label}
                hint={slot.hint}
                image={slotImage}
                isLoading={isLoading}
                onUpload={(file) => handleUploadSlot(slot.key, index, file)}
                onReplace={(file) => slotImage && handleReplaceSlot(slot.key, index, file, slotImage.id)}
                onDelete={() => slotImage && handleDeleteImage(slot.key, slotImage.id, slot.label)}
                onSetPrimary={() => slotImage && handleSetPrimary(slot.key, slotImage.id)}
              />
            )
          })}
        </div>

        {/* Additional Photos Section */}
        {additionalImages.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-black/10 pt-4 dark:border-white/10">
            <h4 className="text-xs font-bold uppercase tracking-wider text-black/70 dark:text-white/70">
              Additional Photos ({additionalImages.length})
            </h4>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {additionalImages.map((extraImg, idx) => {
                const isLoading = activeSlotLoading === `extra-${extraImg.id}`
                return (
                  <div
                    key={extraImg.id}
                    className="group relative flex aspect-square flex-col overflow-hidden rounded-xl border border-black/10 bg-gray-100 dark:border-white/10 dark:bg-gray-800"
                  >
                    <img
                      src={extraImg.imageUrl}
                      alt={`Extra ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                    {isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs font-semibold text-white">
                        Updating…
                      </div>
                    )}
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() =>
                        handleDeleteImage(`extra-${extraImg.id}`, extraImg.id, `Extra photo #${idx + 1}`)
                      }
                      className="absolute right-1.5 top-1.5 rounded-md bg-black/70 p-1 text-white opacity-0 transition-opacity hover:bg-black group-hover:opacity-100 dark:bg-white/80 dark:text-black dark:hover:bg-white"
                      title="Delete photo"
                    >
                      <HugeiconsIcon icon={Delete02Icon} size={14} />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Modal Actions Footer */}
        <div className="flex items-center justify-between border-t border-black/10 pt-4 dark:border-white/10">
          <div>
            <input
              ref={extraFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleUploadExtra(file)
              }}
            />
            <Button
              type="button"
              variant="secondary"
              disabled={extraUploading}
              onClick={() => extraFileInputRef.current?.click()}
              className="text-xs"
            >
              <HugeiconsIcon icon={Upload01Icon} size={14} />
              {extraUploading ? 'Uploading…' : '+ Add Extra Photo'}
            </Button>
          </div>

          <Button type="button" onClick={onClose} className="px-5 text-xs font-semibold">
            <HugeiconsIcon icon={Tick01Icon} size={16} />
            Done
          </Button>
        </div>
      </div>
    </Modal>
  )
}

interface PhotoSlotCardProps {
  slotKey: ColorImageSlotKey
  index: number
  label: string
  hint: string
  image?: ProductImage
  isLoading: boolean
  onUpload: (file: File) => void
  onReplace: (file: File) => void
  onDelete: () => void
  onSetPrimary: () => void
}

function PhotoSlotCard({
  label,
  hint,
  image,
  isLoading,
  onUpload,
  onReplace,
  onDelete,
  onSetPrimary,
}: PhotoSlotCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (image) {
      onReplace(file)
    } else {
      onUpload(file)
    }

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-black/10 bg-white p-3 shadow-2xs dark:border-white/10 dark:bg-black">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Slot Header */}
      <div className="flex items-start justify-between gap-1">
        <div className="min-w-0">
          <p className="truncate text-xs font-bold text-black dark:text-white" title={label}>
            {label}
          </p>
          <p className="line-clamp-1 text-[10px] text-black/50 dark:text-white/50" title={hint}>
            {hint}
          </p>
        </div>
        {image?.isPrimary && (
          <span
            className="flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 shrink-0"
            title="Catalog Hero Photo"
          >
            <HugeiconsIcon icon={StarIcon} size={10} />
            Primary
          </span>
        )}
      </div>

      {/* Image Preview / Upload Box */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg border border-black/10 bg-gray-50 dark:border-white/10 dark:bg-white/5">
        {isLoading ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black/60 text-white">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span className="text-[11px] font-medium">Processing…</span>
          </div>
        ) : image ? (
          <>
            <img
              src={image.imageUrl}
              alt={label}
              className="h-full w-full object-cover transition-transform duration-200 hover:scale-105"
            />
            {/* Hover overlay with action buttons */}
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/75 via-transparent to-transparent p-2 opacity-0 transition-opacity hover:opacity-100">
              <div className="flex items-center justify-between gap-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-md bg-white/90 px-2 py-1 text-[11px] font-bold text-black hover:bg-white transition-colors cursor-pointer"
                >
                  Replace
                </button>
                <div className="flex items-center gap-1">
                  {!image.isPrimary && (
                    <button
                      type="button"
                      onClick={onSetPrimary}
                      title="Set as catalog thumbnail"
                      className="rounded-md bg-black/70 p-1 text-white hover:bg-black transition-colors cursor-pointer"
                    >
                      <HugeiconsIcon icon={StarIcon} size={13} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onDelete}
                    title="Delete photo"
                    className="rounded-md bg-rose-600/80 p-1 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                  >
                    <HugeiconsIcon icon={Delete02Icon} size={13} />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-full w-full flex-col items-center justify-center gap-1.5 p-3 text-center transition-colors hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-black/50 dark:bg-white/10 dark:text-white/50">
              <HugeiconsIcon icon={Upload01Icon} size={18} />
            </div>
            <span className="text-[11px] font-semibold text-black/70 dark:text-white/70">
              Upload Photo
            </span>
            <span className="text-[10px] text-black/40 dark:text-white/40">
              Click to select image
            </span>
          </button>
        )}
      </div>

      {/* Button Controls below card */}
      {image ? (
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="secondary"
            disabled={isLoading}
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-1 text-[11px]"
          >
            <HugeiconsIcon icon={Upload01Icon} size={12} />
            Replace
          </Button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onDelete}
            title="Delete this photo"
            className="rounded-md border border-rose-200/60 bg-rose-50/60 p-1.5 text-rose-600 hover:bg-rose-100/80 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400 dark:hover:bg-rose-900/30 transition-colors cursor-pointer"
          >
            <HugeiconsIcon icon={Delete02Icon} size={14} />
          </button>
        </div>
      ) : (
        <Button
          type="button"
          variant="secondary"
          disabled={isLoading}
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-1 text-[11px]"
        >
          <HugeiconsIcon icon={Upload01Icon} size={12} />
          Choose Photo
        </Button>
      )}
    </div>
  )
}
