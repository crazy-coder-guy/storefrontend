import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Input } from '../../components/Input'
import { Select } from '../../components/Select'
import { Button } from '../../components/Button'

const schema = z.object({
  type: z.enum(['RESTOCK', 'MANUAL_INCREASE', 'MANUAL_DECREASE', 'ADJUSTMENT']),
  quantity: z.coerce.number().int().min(0, 'Quantity must be 0 or greater'),
  reason: z.string().optional(),
})

export type StockAdjustFormValues = z.output<typeof schema>

interface StockAdjustFormProps {
  currentStock: number
  onSubmit: (values: StockAdjustFormValues) => void
  isSubmitting?: boolean
  onCancel: () => void
}

export function StockAdjustForm({ currentStock, onSubmit, isSubmitting, onCancel }: StockAdjustFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'RESTOCK', quantity: 0, reason: '' },
  })

  const type = watch('type')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <p className="text-sm text-black/60 dark:text-white/60">Current stock: {currentStock}</p>

      <Select label="Adjustment Type" {...register('type')} error={errors.type?.message}>
        <option value="RESTOCK">Restock (add)</option>
        <option value="MANUAL_INCREASE">Manual increase (add)</option>
        <option value="MANUAL_DECREASE">Manual decrease (subtract)</option>
        <option value="ADJUSTMENT">Adjustment (set exact value)</option>
      </Select>

      <Input
        label={type === 'ADJUSTMENT' ? 'New stock quantity' : 'Quantity'}
        type="number"
        {...register('quantity')}
        error={errors.quantity?.message}
      />

      <Input label="Reason (optional)" {...register('reason')} error={errors.reason?.message} />

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Apply'}
        </Button>
      </div>
    </form>
  )
}
