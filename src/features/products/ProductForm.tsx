import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Input } from '../../components/Input'
import { Textarea } from '../../components/Textarea'
import { Select } from '../../components/Select'
import { Button } from '../../components/Button'
import { useAllCategories } from '../categories/hooks/useAllCategories'
import { BADGE_OPTIONS } from '../../utils/constants'
import type { Product } from '../../types'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  productType: z.string().min(1, 'Product type is required'),
  basePrice: z.coerce.number().positive('Base price must be greater than 0'),
  mrp: z.coerce.number().positive('MRP must be greater than 0'),
  badge: z.string().max(50).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT']),
  gsm: z
    .string()
    .optional()
    .refine((v) => !v || (Number.isInteger(Number(v)) && Number(v) > 0), {
      message: 'GSM must be a positive whole number',
    }),
  fabric: z.string().optional(),
  fit: z.union([z.enum(['REGULAR', 'SLIM', 'OVERSIZED', 'RELAXED']), z.literal('')]).optional(),
  neckType: z.union([z.enum(['CREW', 'V_NECK', 'POLO', 'ROUND', 'MOCK']), z.literal('')]).optional(),
  biowash: z.boolean().optional(),
})

export type ProductFormValues = z.output<typeof schema>

interface ProductFormProps {
  initialValues?: Product
  onSubmit: (values: ProductFormValues) => void
  isSubmitting?: boolean
  onCancel: () => void
}

export function ProductForm({ initialValues, onSubmit, isSubmitting, onCancel }: ProductFormProps) {
  const { data: categoriesData, isLoading: categoriesLoading } = useAllCategories()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialValues?.name ?? '',
      slug: initialValues?.slug ?? '',
      description: initialValues?.description ?? '',
      categoryId: initialValues?.categoryId ?? '',
      productType: initialValues?.productType ?? '',
      basePrice: initialValues?.basePrice ?? 0,
      mrp: initialValues?.mrp ?? 0,
      badge: initialValues?.badge ?? '',
      status: initialValues?.status ?? 'DRAFT',
      gsm: initialValues?.gsm != null ? String(initialValues.gsm) : '',
      fabric: initialValues?.fabric ?? '',
      fit: initialValues?.fit ?? '',
      neckType: initialValues?.neckType ?? '',
      biowash: initialValues?.biowash ?? false,
    },
  })

  const watchedBasePrice = Number(watch('basePrice')) || 0
  const watchedMrp = Number(watch('mrp')) || 0

  const discountPercent =
    watchedMrp && watchedBasePrice && watchedMrp > watchedBasePrice
      ? Math.round(((watchedMrp - watchedBasePrice) / watchedMrp) * 100)
      : 0

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-2xs dark:border-white/10 dark:bg-black">
        <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-black/60 dark:text-white/60">
          General Details
        </h3>
        <div className="flex flex-col gap-4">
          <Input label="Name" {...register('name')} error={errors.name?.message} />
          <Input
            label="Slug"
            hint="Unique product URL identifier."
            {...register('slug')}
            error={errors.slug?.message}
          />
          <Textarea label="Description" rows={4} {...register('description')} error={errors.description?.message} />
          <Input
            label="Product Type"
            placeholder="e.g. crew-neck, v-neck, oversized"
            {...register('productType')}
            error={errors.productType?.message}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-2xs dark:border-white/10 dark:bg-black">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-black/60 dark:text-white/60">
            Pricing & Organization
          </h3>
          {discountPercent > 0 && (
            <span className="rounded bg-black/10 px-2 py-0.5 text-xs font-semibold text-black dark:bg-white/10 dark:text-white">
              {discountPercent}% Off
            </span>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Base Price (₹)"
              type="number"
              step="0.01"
              {...register('basePrice')}
              error={errors.basePrice?.message}
            />
            <Input label="MRP (₹)" type="number" step="0.01" {...register('mrp')} error={errors.mrp?.message} />
          </div>

          <Select label="Category" {...register('categoryId')} error={errors.categoryId?.message}>
            <option value="">{categoriesLoading ? 'Loading…' : 'Select a category'}</option>
            {categoriesData?.items.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>

          <Select label="Badge" {...register('badge')} error={errors.badge?.message}>
            <option value="">None</option>
            {BADGE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>

          <Select label="Publication Status" {...register('status')} error={errors.status?.message}>
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </Select>
        </div>
      </div>

      <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-2xs dark:border-white/10 dark:bg-black">
        <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-black/60 dark:text-white/60">
          Specifications
        </h3>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="GSM"
              type="number"
              placeholder="e.g. 180"
              hint="Fabric weight, grams per square meter."
              {...register('gsm')}
              error={errors.gsm?.message}
            />
            <Input
              label="Fabric"
              placeholder="e.g. 100% Cotton"
              {...register('fabric')}
              error={errors.fabric?.message}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select label="Fit" {...register('fit')} error={errors.fit?.message}>
              <option value="">Not specified</option>
              <option value="REGULAR">Regular</option>
              <option value="SLIM">Slim</option>
              <option value="OVERSIZED">Oversized</option>
              <option value="RELAXED">Relaxed</option>
            </Select>
            <Select label="Neck Type" {...register('neckType')} error={errors.neckType?.message}>
              <option value="">Not specified</option>
              <option value="CREW">Crew</option>
              <option value="V_NECK">V-Neck</option>
              <option value="POLO">Polo</option>
              <option value="ROUND">Round</option>
              <option value="MOCK">Mock</option>
            </Select>
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-black/80 dark:text-white/80">
            <input
              type="checkbox"
              {...register('biowash')}
              className="h-4 w-4 rounded border-black/20 accent-black dark:border-white/30 dark:accent-white"
            />
            Biowashed fabric
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting} className="px-4 py-2 text-xs">
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="px-4 py-2 text-xs">
          {isSubmitting ? 'Saving…' : initialValues ? 'Save changes' : 'Create product'}
        </Button>
      </div>
    </form>
  )
}
