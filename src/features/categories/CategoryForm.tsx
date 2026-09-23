import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Input } from '../../components/Input'
import { Textarea } from '../../components/Textarea'
import { Select } from '../../components/Select'
import { Button } from '../../components/Button'
import { slugify } from '../../utils/slugify'
import { BADGE_OPTIONS } from '../../utils/constants'
import type { Category } from '../../types'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().optional(),
  description: z.string().optional(),
  badge: z.string().max(50).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
})

export type CategoryFormValues = z.infer<typeof schema>

interface CategoryFormProps {
  initialValues?: Category
  onSubmit: (values: CategoryFormValues) => void
  isSubmitting?: boolean
  onCancel: () => void
}

export function CategoryForm({ initialValues, onSubmit, isSubmitting, onCancel }: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialValues?.name ?? '',
      slug: initialValues?.slug ?? '',
      description: initialValues?.description ?? '',
      badge: initialValues?.badge ?? '',
      status: initialValues?.status ?? 'ACTIVE',
    },
  })

  const name = watch('name')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input label="Name" {...register('name')} error={errors.name?.message} />
      <Input
        label="Slug"
        placeholder={name ? slugify(name) : 'auto-generated-from-name'}
        hint="Leave blank to auto-generate from the name."
        {...register('slug')}
        error={errors.slug?.message}
        onChange={(e) => setValue('slug', e.target.value)}
      />
      <Textarea label="Description" rows={3} {...register('description')} error={errors.description?.message} />
      <Select label="Badge" {...register('badge')} error={errors.badge?.message}>
        <option value="">None</option>
        {BADGE_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Select>
      <Select label="Status" {...register('status')} error={errors.status?.message}>
        <option value="ACTIVE">Active</option>
        <option value="INACTIVE">Inactive</option>
      </Select>

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : initialValues ? 'Save changes' : 'Create category'}
        </Button>
      </div>
    </form>
  )
}
