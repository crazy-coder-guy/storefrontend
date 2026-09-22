import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Input } from '../../components/Input'
import { Select } from '../../components/Select'
import { Button } from '../../components/Button'
import { useAllColors } from '../colors/hooks/useAllColors'
import { useAllSizes } from '../sizes/hooks/useAllSizes'
import type { ProductVariant } from '../../types'

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
  status: z.enum(['ACTIVE', 'INACTIVE']),
})

export type VariantFormValues = z.output<typeof schema>

interface VariantFormProps {
  initialValues?: ProductVariant
  onSubmit: (values: VariantFormValues) => void
  isSubmitting?: boolean
  onCancel: () => void
}

export function VariantForm({ initialValues, onSubmit, isSubmitting, onCancel }: VariantFormProps) {
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
      status: initialValues?.status ?? 'ACTIVE',
    },
  })

  const selectedColor = colorsData?.items.find((color) => color.id === watch('colorId'))

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
                <option key={color.id} value={color.id}>
                  {color.name}
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

      <Select label="Status" {...register('status')} error={errors.status?.message}>
        <option value="ACTIVE">Active</option>
        <option value="INACTIVE">Inactive</option>
      </Select>

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
