import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Input } from '../../components/Input'
import { Select } from '../../components/Select'
import { Button } from '../../components/Button'
import type { Color } from '../../types'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  hexCode: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Enter a valid hex color, e.g. #000000'),
  status: z.enum(['ACTIVE', 'INACTIVE']),
})

export type ColorFormValues = z.infer<typeof schema>

interface ColorFormProps {
  initialValues?: Color
  onSubmit: (values: ColorFormValues) => void
  isSubmitting?: boolean
  onCancel: () => void
}

export function ColorForm({ initialValues, onSubmit, isSubmitting, onCancel }: ColorFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ColorFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialValues?.name ?? '',
      code: initialValues?.code ?? '',
      hexCode: initialValues?.hexCode ?? '#000000',
      status: initialValues?.status ?? 'ACTIVE',
    },
  })

  const hexCode = watch('hexCode')
  const isValidHex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hexCode)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input label="Name" placeholder="Black" {...register('name')} error={errors.name?.message} />
      <Input label="Code" placeholder="BLK" {...register('code')} error={errors.code?.message} />
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <Input label="Hex Code" placeholder="#000000" {...register('hexCode')} error={errors.hexCode?.message} />
        </div>
        <div
          className="mb-1.5 h-9 w-9 shrink-0 rounded-lg border border-black/15 dark:border-white/20"
          style={{ backgroundColor: isValidHex ? hexCode : 'transparent' }}
          aria-hidden
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
          {isSubmitting ? 'Saving…' : initialValues ? 'Save changes' : 'Create color'}
        </Button>
      </div>
    </form>
  )
}
