import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { Textarea } from '../../components/Textarea'
import { cn } from '../../utils/cn'
import type { StorefrontSettings } from '../../types'

const schema = z.object({
  announcementText: z.string().min(1, 'Announcement text is required').max(300),
  heroTitle: z.string().min(1, 'Hero title is required').max(200),
  heroSubtitle: z.string().min(1, 'Hero subtitle is required').max(500),
})

export type StorefrontSettingsFormValues = z.infer<typeof schema>

interface StorefrontSettingsFormProps {
  settings: StorefrontSettings
  onSubmit: (values: StorefrontSettingsFormValues) => void
  isSubmitting?: boolean
  className?: string
}

export function StorefrontSettingsForm({ settings, onSubmit, isSubmitting, className }: StorefrontSettingsFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<StorefrontSettingsFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      announcementText: settings.announcementText,
      heroTitle: settings.heroTitle,
      heroSubtitle: settings.heroSubtitle,
    },
  })

  // Keep the form in sync if settings are refetched/updated elsewhere.
  useEffect(() => {
    reset({
      announcementText: settings.announcementText,
      heroTitle: settings.heroTitle,
      heroSubtitle: settings.heroSubtitle,
    })
  }, [settings, reset])

  return (
    <form
      onSubmit={handleSubmit((values) => onSubmit(values))}
      className={cn('max-w-2xl rounded-xl border border-black/10 p-5 dark:border-white/10', className)}
    >
      <h2 className="text-sm font-semibold">Homepage content</h2>
      <p className="mt-1 text-sm text-black/50 dark:text-white/50">
        Editable copy shown on the customer storefront.
      </p>

      <div className="mt-4 flex flex-col gap-4">
        <Input
          label="Top announcement bar"
          hint="Shown in the thin banner above the site header, e.g. shipping/returns messaging."
          {...register('announcementText')}
          error={errors.announcementText?.message}
        />
        <Input
          label="Hero title"
          hint="The large heading on the homepage banner."
          {...register('heroTitle')}
          error={errors.heroTitle?.message}
        />
        <div className="flex flex-col gap-1.5">
          <Textarea
            label="Hero subtitle"
            rows={3}
            {...register('heroSubtitle')}
            error={errors.heroSubtitle?.message}
          />
          <p className="text-xs text-black/50 dark:text-white/50">
            The supporting line under the hero title.
          </p>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button type="submit" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </form>
  )
}
