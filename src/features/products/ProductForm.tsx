import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Input } from '../../components/Input'
import { Textarea } from '../../components/Textarea'
import { Select } from '../../components/Select'
import { Button } from '../../components/Button'
import { useAllCategories } from '../categories/hooks/useAllCategories'
import type { Product } from '../../types'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  productType: z.string().min(1, 'Product type is required'),
  basePrice: z.coerce.number().positive('Base price must be greater than 0'),
  mrp: z.coerce.number().positive('MRP must be greater than 0'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT']),
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
      status: initialValues?.status ?? 'DRAFT',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input label="Name" {...register('name')} error={errors.name?.message} />
      <Input
        label="Slug"
        hint="Leave blank to auto-generate from the name."
        {...register('slug')}
        error={errors.slug?.message}
      />
      <Textarea label="Description" rows={3} {...register('description')} error={errors.description?.message} />

      <Select label="Category" {...register('categoryId')} error={errors.categoryId?.message}>
        <option value="">{categoriesLoading ? 'Loading…' : 'Select a category'}</option>
        {categoriesData?.items.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </Select>

      <Input
        label="Product Type"
        placeholder="e.g. crew-neck, v-neck, oversized"
        {...register('productType')}
        error={errors.productType?.message}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Base Price"
          type="number"
          step="0.01"
          {...register('basePrice')}
          error={errors.basePrice?.message}
        />
        <Input label="MRP" type="number" step="0.01" {...register('mrp')} error={errors.mrp?.message} />
      </div>

      <Select label="Status" {...register('status')} error={errors.status?.message}>
        <option value="DRAFT">Draft</option>
        <option value="ACTIVE">Active</option>
        <option value="INACTIVE">Inactive</option>
      </Select>

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : initialValues ? 'Save changes' : 'Create product'}
        </Button>
      </div>
    </form>
  )
}
