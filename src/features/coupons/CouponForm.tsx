import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Input } from '../../components/Input'
import { Select } from '../../components/Select'
import { Button } from '../../components/Button'
import type { Coupon } from '../../types'

const schema = z
  .object({
    code: z
      .string()
      .min(3, 'At least 3 characters')
      .max(30)
      .regex(/^[A-Za-z0-9_-]+$/, 'Letters, numbers, hyphens and underscores only'),
    type: z.enum(['PERCENTAGE', 'FIXED']),
    value: z.coerce.number().positive('Must be greater than 0'),
    minOrderValue: z.coerce.number().min(0).optional().or(z.literal('').transform(() => undefined)),
    maxDiscountAmount: z.coerce.number().positive().optional().or(z.literal('').transform(() => undefined)),
    usageLimit: z.coerce.number().int().positive().optional().or(z.literal('').transform(() => undefined)),
    perUserLimit: z.coerce.number().int().positive().default(1),
    expiresAt: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']),
  })
  .refine((data) => data.type !== 'PERCENTAGE' || data.value <= 100, {
    message: 'A percentage coupon cannot exceed 100',
    path: ['value'],
  })

export type CouponFormValues = z.output<typeof schema>

interface CouponFormProps {
  initialValues?: Coupon
  onSubmit: (values: CouponFormValues) => void
  isSubmitting?: boolean
  onCancel: () => void
}

export function CouponForm({ initialValues, onSubmit, isSubmitting, onCancel }: CouponFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: initialValues?.code ?? '',
      type: initialValues?.type ?? 'PERCENTAGE',
      value: initialValues ? Number(initialValues.value) : undefined,
      minOrderValue: initialValues?.minOrderValue != null ? Number(initialValues.minOrderValue) : undefined,
      maxDiscountAmount:
        initialValues?.maxDiscountAmount != null ? Number(initialValues.maxDiscountAmount) : undefined,
      usageLimit: initialValues?.usageLimit ?? undefined,
      perUserLimit: initialValues?.perUserLimit ?? 1,
      expiresAt: initialValues?.expiresAt ? initialValues.expiresAt.slice(0, 10) : undefined,
      status: initialValues?.status ?? 'ACTIVE',
    },
  })

  const type = watch('type')

  return (
    <form onSubmit={handleSubmit((values) => onSubmit(values))} className="flex flex-col gap-4">
      <Input
        label="Code"
        placeholder="WELCOME20"
        {...register('code')}
        error={errors.code?.message}
        disabled={!!initialValues}
        className={initialValues ? 'uppercase opacity-60' : 'uppercase'}
      />

      <div className="grid grid-cols-2 gap-4">
        <Select label="Discount Type" {...register('type')} error={errors.type?.message}>
          <option value="PERCENTAGE">Percentage off</option>
          <option value="FIXED">Fixed amount off</option>
        </Select>
        <Input
          label={type === 'PERCENTAGE' ? 'Value (%)' : 'Value (₹)'}
          type="number"
          step="0.01"
          {...register('value')}
          error={errors.value?.message}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Min. order value (₹)"
          type="number"
          step="0.01"
          placeholder="Optional"
          {...register('minOrderValue')}
          error={errors.minOrderValue?.message}
        />
        <Input
          label="Max discount cap (₹)"
          type="number"
          step="0.01"
          placeholder={type === 'PERCENTAGE' ? 'Optional' : 'Not applicable'}
          disabled={type === 'FIXED'}
          {...register('maxDiscountAmount')}
          error={errors.maxDiscountAmount?.message}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Total usage limit"
          type="number"
          placeholder="Unlimited"
          {...register('usageLimit')}
          error={errors.usageLimit?.message}
        />
        <Input
          label="Uses per customer"
          type="number"
          {...register('perUserLimit')}
          error={errors.perUserLimit?.message}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Expires on"
          type="date"
          placeholder="Never"
          {...register('expiresAt')}
          error={errors.expiresAt?.message}
        />
        <Select label="Status" {...register('status')} error={errors.status?.message}>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </Select>
      </div>

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : initialValues ? 'Save changes' : 'Create coupon'}
        </Button>
      </div>
    </form>
  )
}
