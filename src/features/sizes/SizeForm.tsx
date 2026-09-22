import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Input } from '../../components/Input'
import { Select } from '../../components/Select'
import { Button } from '../../components/Button'
import type { Size } from '../../types'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  sortOrder: z.coerce.number().int().default(0),
  status: z.enum(['ACTIVE', 'INACTIVE']),
})

export type SizeFormValues = z.output<typeof schema>

interface SizeFormProps {
  initialValues?: Size
  onSubmit: (values: SizeFormValues) => void
  isSubmitting?: boolean
  onCancel: () => void
}

export function SizeForm({ initialValues, onSubmit, isSubmitting, onCancel }: SizeFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialValues?.name ?? '',
      code: initialValues?.code ?? '',
      sortOrder: initialValues?.sortOrder ?? 0,
      status: initialValues?.status ?? 'ACTIVE',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input label="Name" placeholder="Small" {...register('name')} error={errors.name?.message} />
      <Input label="Code" placeholder="S" {...register('code')} error={errors.code?.message} />
      <Input
        label="Sort Order"
        type="number"
        {...register('sortOrder')}
        error={errors.sortOrder?.message}
      />
      <Select label="Status" {...register('status')} error={errors.status?.message}>
        <option value="ACTIVE">Active</option>
        <option value="INACTIVE">Inactive</option>
      </Select>

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : initialValues ? 'Save changes' : 'Create size'}
        </Button>
      </div>
    </form>
  )
}
