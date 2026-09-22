import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useEffect } from 'react'
import { Input } from '../../components/Input'
import { Textarea } from '../../components/Textarea'
import { Button } from '../../components/Button'
import type { AdminSettings } from '../../types'

const schema = z.object({
  storeName: z.string().min(1, 'Store name is required'),
  storeEmail: z.string().email('Enter a valid email').or(z.literal('')),
  storePhone: z.string().optional(),
  storeAddress: z.string().optional(),
  currency: z.string().min(1, 'Currency is required'),
  lowStockThreshold: z.coerce.number().int().min(0),
})

export type SettingsFormValues = z.output<typeof schema>

interface SettingsFormProps {
  values: AdminSettings
  onSubmit: (values: SettingsFormValues) => void
  isSubmitting?: boolean
}

export function SettingsForm({ values, onSubmit, isSubmitting }: SettingsFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: values,
  })

  useEffect(() => {
    reset(values)
  }, [values, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-lg flex-col gap-4">
      <Input label="Store Name" {...register('storeName')} error={errors.storeName?.message} />
      <Input label="Store Email" type="email" {...register('storeEmail')} error={errors.storeEmail?.message} />
      <Input label="Store Phone" {...register('storePhone')} error={errors.storePhone?.message} />
      <Textarea label="Store Address" rows={3} {...register('storeAddress')} error={errors.storeAddress?.message} />
      <Input label="Currency" {...register('currency')} error={errors.currency?.message} />
      <Input
        label="Low Stock Threshold"
        type="number"
        hint="Used by the Dashboard and Inventory pages to flag low-stock variants."
        {...register('lowStockThreshold')}
        error={errors.lowStockThreshold?.message}
      />

      <div className="mt-2 flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save Settings'}
        </Button>
      </div>
    </form>
  )
}
