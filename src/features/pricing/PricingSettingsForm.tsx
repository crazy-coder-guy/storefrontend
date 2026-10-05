import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { cn } from '../../utils/cn'
import type { PricingSettings } from '../../types'

const schema = z.object({
  packagingCost: z.coerce.number().nonnegative('Must be 0 or more'),
  courierCost: z.coerce.number().nonnegative('Must be 0 or more'),
  paymentGatewayPercent: z.coerce.number().nonnegative('Must be 0 or more'),
  exchangeBuffer: z.coerce.number().nonnegative('Must be 0 or more'),
  miscCost: z.coerce.number().nonnegative('Must be 0 or more'),
  marketingCost: z.coerce.number().nonnegative('Must be 0 or more'),
  targetProfit: z.coerce.number().nonnegative('Must be 0 or more'),
  freeShippingThreshold: z.coerce.number().nonnegative('Must be 0 or more'),
  shippingCharge: z.coerce.number().nonnegative('Must be 0 or more'),
})

export type PricingSettingsFormValues = z.output<typeof schema>

interface PricingSettingsFormProps {
  settings: PricingSettings
  onSubmit: (values: PricingSettingsFormValues) => void
  isSubmitting?: boolean
  className?: string
}

export function PricingSettingsForm({ settings, onSubmit, isSubmitting, className }: PricingSettingsFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      packagingCost: settings.packagingCost,
      courierCost: settings.courierCost,
      paymentGatewayPercent: settings.paymentGatewayPercent,
      exchangeBuffer: settings.exchangeBuffer,
      miscCost: settings.miscCost,
      marketingCost: settings.marketingCost,
      targetProfit: settings.targetProfit,
      freeShippingThreshold: settings.freeShippingThreshold,
      shippingCharge: settings.shippingCharge,
    },
  })

  // Keep the form in sync if settings are refetched/updated elsewhere.
  useEffect(() => {
    reset({
      packagingCost: settings.packagingCost,
      courierCost: settings.courierCost,
      paymentGatewayPercent: settings.paymentGatewayPercent,
      exchangeBuffer: settings.exchangeBuffer,
      miscCost: settings.miscCost,
      marketingCost: settings.marketingCost,
      targetProfit: settings.targetProfit,
      freeShippingThreshold: settings.freeShippingThreshold,
      shippingCharge: settings.shippingCharge,
    })
  }, [settings, reset])

  return (
    <form
      onSubmit={handleSubmit((values) => onSubmit(values))}
      className={cn('max-w-2xl rounded-xl border border-black/10 p-5 dark:border-white/10', className)}
    >
      <h2 className="text-sm font-semibold">Pricing & profitability inputs</h2>
      <p className="mt-1 text-sm text-black/50 dark:text-white/50">
        These costs drive the recommended selling price shown while editing products, and the
        profitability figures on the dashboard.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Packaging Cost (₹ per order)"
          type="number"
          step="0.01"
          {...register('packagingCost')}
          error={errors.packagingCost?.message}
        />
        <Input
          label="Courier Cost (₹ per order)"
          type="number"
          step="0.01"
          {...register('courierCost')}
          error={errors.courierCost?.message}
        />
        <Input
          label="Payment Gateway Fee (%)"
          type="number"
          step="0.01"
          hint="Charged as a percentage of the selling price"
          {...register('paymentGatewayPercent')}
          error={errors.paymentGatewayPercent?.message}
        />
        <Input
          label="Exchange/Return Buffer (₹ per order)"
          type="number"
          step="0.01"
          {...register('exchangeBuffer')}
          error={errors.exchangeBuffer?.message}
        />
        <Input
          label="Miscellaneous Cost (₹ per order)"
          type="number"
          step="0.01"
          {...register('miscCost')}
          error={errors.miscCost?.message}
        />
        <Input
          label="Marketing Cost (₹ per order)"
          type="number"
          step="0.01"
          {...register('marketingCost')}
          error={errors.marketingCost?.message}
        />
        <Input
          label="Target Profit (₹ per order)"
          type="number"
          step="0.01"
          hint="Desired profit baked into the recommended selling price"
          {...register('targetProfit')}
          error={errors.targetProfit?.message}
        />
        <Input
          label="Free Shipping Threshold (₹)"
          type="number"
          step="0.01"
          hint="Orders at or above this value ship free"
          {...register('freeShippingThreshold')}
          error={errors.freeShippingThreshold?.message}
        />
        <Input
          label="Shipping Charge Below Threshold (₹)"
          type="number"
          step="0.01"
          {...register('shippingCharge')}
          error={errors.shippingCharge?.message}
        />
      </div>

      <div className="mt-4 flex justify-end">
        <Button type="submit" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </form>
  )
}
