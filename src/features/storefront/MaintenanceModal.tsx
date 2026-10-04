import { useEffect, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Alert02Icon,
  Clock01Icon,
  SecurityCheckIcon,
  Tick01Icon,
} from '@hugeicons/core-free-icons'
import { Modal } from '../../components/Modal'
import { Button } from '../../components/Button'
import { Textarea } from '../../components/Textarea'
import { useUpdateStorefrontSettings } from './hooks/useStorefrontSettings'
import { toast } from '../../lib/toast'
import type { StorefrontSettings } from '../../types'

interface MaintenanceModalProps {
  open: boolean
  onClose: () => void
  settings?: StorefrontSettings
}

const PRESETS = [
  { label: '15 Mins', minutes: 15 },
  { label: '30 Mins', minutes: 30 },
  { label: '1 Hour', minutes: 60 },
  { label: '2 Hours', minutes: 120 },
  { label: '4 Hours', minutes: 240 },
  { label: '12 Hours', minutes: 720 },
  { label: '24 Hours', minutes: 1440 },
]

export function MaintenanceModal({ open, onClose, settings }: MaintenanceModalProps) {
  const updateSettings = useUpdateStorefrontSettings()

  const isCurrentlyActive = Boolean(
    settings?.isMaintenance &&
      (!settings.maintenanceUntil || new Date(settings.maintenanceUntil) > new Date())
  )

  const [expectedUntil, setExpectedUntil] = useState<string>('')
  const [notice, setNotice] = useState<string>('')
  const [selectedPresetMinutes, setSelectedPresetMinutes] = useState<number | null>(60)
  const [customDateTime, setCustomDateTime] = useState<string>('')

  // Sync state whenever modal opens or settings load
  useEffect(() => {
    if (open) {
      if (settings?.maintenanceUntil) {
        setExpectedUntil(settings.maintenanceUntil)
        const dateObj = new Date(settings.maintenanceUntil)
        // Format to YYYY-MM-DDTHH:mm for datetime-local
        const pad = (n: number) => String(n).padStart(2, '0')
        const localIso = `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(
          dateObj.getDate()
        )}T${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}`
        setCustomDateTime(localIso)
        setSelectedPresetMinutes(null)
      } else {
        // Default to 1 hour preset if not currently set
        applyPreset(60)
      }
      setNotice(settings?.maintenanceNotice ?? '')
    }
  }, [open, settings])

  function applyPreset(minutes: number) {
    setSelectedPresetMinutes(minutes)
    const target = new Date(Date.now() + minutes * 60 * 1000)
    setExpectedUntil(target.toISOString())

    const pad = (n: number) => String(n).padStart(2, '0')
    const localIso = `${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(
      target.getDate()
    )}T${pad(target.getHours())}:${pad(target.getMinutes())}`
    setCustomDateTime(localIso)
  }

  function handleCustomDateTimeChange(value: string) {
    setCustomDateTime(value)
    setSelectedPresetMinutes(null)
    if (value) {
      const parsed = new Date(value)
      if (!Number.isNaN(parsed.getTime())) {
        setExpectedUntil(parsed.toISOString())
      }
    } else {
      setExpectedUntil('')
    }
  }

  // Live countdown timer for active maintenance
  const [remainingTime, setRemainingTime] = useState<{
    hours: number
    minutes: number
    seconds: number
    isExpired: boolean
  }>({ hours: 0, minutes: 0, seconds: 0, isExpired: false })

  useEffect(() => {
    if (!open) return

    function calculate() {
      const targetTime = settings?.maintenanceUntil
        ? new Date(settings.maintenanceUntil).getTime()
        : expectedUntil
        ? new Date(expectedUntil).getTime()
        : null

      if (!targetTime) {
        setRemainingTime({ hours: 0, minutes: 0, seconds: 0, isExpired: false })
        return
      }

      const diff = targetTime - Date.now()
      if (diff <= 0) {
        setRemainingTime({ hours: 0, minutes: 0, seconds: 0, isExpired: true })
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)
        setRemainingTime({ hours, minutes, seconds, isExpired: false })
      }
    }

    calculate()
    const timer = setInterval(calculate, 1000)
    return () => clearInterval(timer)
  }, [open, settings?.maintenanceUntil, expectedUntil])

  async function handleTurnOnMaintenance() {
    if (!expectedUntil) {
      toast.error('Please specify an expected end time for maintenance mode')
      return
    }

    try {
      await updateSettings.mutateAsync({
        isMaintenance: true,
        maintenanceUntil: expectedUntil,
        maintenanceNotice: notice.trim() || null,
      })
      toast.success(
        `Maintenance Mode ENABLED until ${new Date(expectedUntil).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          day: 'numeric',
          month: 'short',
        })}`
      )
      onClose()
    } catch {
      toast.error('Failed to enable maintenance mode')
    }
  }

  async function handleTurnOffMaintenance() {
    try {
      await updateSettings.mutateAsync({
        isMaintenance: false,
        maintenanceUntil: null,
      })
      toast.success('Maintenance Mode TURNED OFF — Store is now live!')
      onClose()
    } catch {
      toast.error('Failed to disable maintenance mode')
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Storefront Maintenance Mode"
      widthClassName="max-w-xl"
    >
      <div className="flex flex-col gap-5">
        {/* Active Status Banner */}
        {isCurrentlyActive ? (
          <div className="flex flex-col gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4.5 dark:border-amber-500/20 dark:bg-amber-500/15">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-rose-500" />
                </span>
                <span className="text-sm font-black uppercase tracking-wider text-rose-700 dark:text-rose-400">
                  Maintenance is LIVE
                </span>
              </div>
              <span className="rounded-md bg-black/10 px-2 py-0.5 text-[11px] font-bold text-black/70 dark:bg-white/10 dark:text-white/70">
                Customer Site Locked
              </span>
            </div>

            <p className="text-xs text-black/70 dark:text-white/70 leading-relaxed">
              The entire customer website is currently showing the maintenance screen. Customers cannot
              browse or checkout until the expected time or until manually disabled.
            </p>

            {/* Countdown timer card */}
            <div className="flex items-center justify-between rounded-xl bg-white/80 p-3 border border-black/10 dark:bg-black/80 dark:border-white/10">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Clock01Icon} size={18} className="text-black/60 dark:text-white/60" />
                <span className="text-xs font-semibold text-black/70 dark:text-white/70">
                  Auto Turn-Off In:
                </span>
              </div>
              <div className="font-mono text-sm sm:text-base font-black text-black dark:text-white">
                {remainingTime.isExpired ? (
                  <span className="text-rose-600">Expired (turning off…)</span>
                ) : (
                  <span>
                    {String(remainingTime.hours).padStart(2, '0')}:
                    {String(remainingTime.minutes).padStart(2, '0')}:
                    {String(remainingTime.seconds).padStart(2, '0')}
                  </span>
                )}
              </div>
            </div>

            {settings?.maintenanceUntil && (
              <div className="text-[11px] text-black/50 dark:text-white/50 text-right">
                Expected End: {new Date(settings.maintenanceUntil).toLocaleString()}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
              <HugeiconsIcon icon={SecurityCheckIcon} size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                Store is Currently Live
              </p>
              <p className="mt-0.5 text-xs text-black/60 dark:text-white/60 leading-relaxed">
                When enabled, visitors will see a branded maintenance page with a live countdown. All
                shopping actions will be safely paused.
              </p>
            </div>
          </div>
        )}

        {/* Expected End Time Section */}
        <div className="flex flex-col gap-3 rounded-xl border border-black/10 bg-gray-50/70 p-4 dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-black dark:text-white flex items-center gap-1.5">
              <HugeiconsIcon icon={Clock01Icon} size={15} />
              <span>Expected End Time (Auto Turn-Off)</span>
            </label>
            <span className="text-[11px] font-medium text-black/40 dark:text-white/40">
              Auto-disables when reached
            </span>
          </div>

          {/* Quick Preset Buttons */}
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
            {PRESETS.map((p) => {
              const isSelected = selectedPresetMinutes === p.minutes
              return (
                <button
                  key={p.minutes}
                  type="button"
                  onClick={() => applyPreset(p.minutes)}
                  className={`rounded-lg py-1.5 px-2 text-xs font-semibold transition-all cursor-pointer text-center ${
                    isSelected
                      ? 'bg-black text-white shadow-xs dark:bg-white dark:text-black font-bold'
                      : 'border border-black/15 bg-white text-black/75 hover:border-black/30 dark:border-white/15 dark:bg-black dark:text-white/75 dark:hover:border-white/30'
                  }`}
                >
                  {p.label}
                </button>
              )
            })}
          </div>

          {/* Custom Date & Time Picker */}
          <div className="flex flex-col gap-1.5 pt-1">
            <span className="text-[11px] font-medium text-black/60 dark:text-white/60">
              Or specify exact date & time:
            </span>
            <input
              type="datetime-local"
              value={customDateTime}
              onChange={(e) => handleCustomDateTimeChange(e.target.value)}
              className="w-full rounded-xl border border-black/15 bg-white px-3.5 py-2 text-xs font-semibold text-black outline-none focus:border-black dark:border-white/15 dark:bg-black dark:text-white dark:focus:border-white"
            />
          </div>

          {expectedUntil && (
            <div className="rounded-lg bg-black/5 p-2.5 text-xs text-black/75 dark:bg-white/5 dark:text-white/75">
              <span className="font-semibold">Auto-turn off set for: </span>
              <span className="font-bold text-black dark:text-white">
                {new Date(expectedUntil).toLocaleDateString([], {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}{' '}
                at{' '}
                {new Date(expectedUntil).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          )}
        </div>

        {/* Custom Notice Message */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">
            Custom Notice Message (Optional)
          </label>
          <Textarea
            value={notice}
            onChange={(e) => setNotice(e.target.value)}
            placeholder="e.g. We are performing scheduled improvements to elevate your shopping experience. We will be back shortly with exclusive drops!"
            rows={2}
          />
          <span className="text-[10px] text-black/40 dark:text-white/40">
            Displayed on the customer maintenance screen above the countdown timer.
          </span>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-between border-t border-black/10 pt-4 dark:border-white/10">
          <Button type="button" variant="secondary" onClick={onClose} disabled={updateSettings.isPending}>
            Cancel
          </Button>

          <div className="flex items-center gap-2">
            {isCurrentlyActive ? (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={updateSettings.isPending}
                  onClick={handleTurnOnMaintenance}
                  className="text-xs font-semibold"
                >
                  <HugeiconsIcon icon={Clock01Icon} size={14} />
                  Update Expected Time
                </Button>
                <button
                  type="button"
                  disabled={updateSettings.isPending}
                  onClick={handleTurnOffMaintenance}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500 bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 shadow-sm cursor-pointer transition-colors disabled:opacity-50"
                >
                  <HugeiconsIcon icon={Tick01Icon} size={15} />
                  Turn OFF Maintenance Mode
                </button>
              </>
            ) : (
              <button
                type="button"
                disabled={updateSettings.isPending || !expectedUntil}
                onClick={handleTurnOnMaintenance}
                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-600 bg-amber-600 px-5 py-2 text-xs font-bold text-white hover:bg-amber-700 shadow-sm cursor-pointer transition-colors disabled:opacity-50"
              >
                <HugeiconsIcon icon={Alert02Icon} size={15} />
                <span>{updateSettings.isPending ? 'Enabling…' : 'Enable Maintenance Mode'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}
