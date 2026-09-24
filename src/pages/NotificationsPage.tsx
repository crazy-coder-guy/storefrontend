import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { Input } from '../components/Input'
import { Textarea } from '../components/Textarea'
import { Select } from '../components/Select'
import { Button } from '../components/Button'
import { Modal } from '../components/Modal'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { HugeiconsIcon } from '@hugeicons/react'
import { Delete02Icon, Megaphone01Icon, UserGroupIcon } from '@hugeicons/core-free-icons'
import {
  useCreateTemplate,
  useDeleteTemplate,
  useSendNotification,
  useSubscriberCount,
  useSubscribers,
  useTemplates,
} from '../features/notifications/hooks/useNotifications'
import type { NotificationTemplate } from '../services/push.service'

const EVERYONE = ''

export function NotificationsPage() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [url, setUrl] = useState('')
  const [recipientId, setRecipientId] = useState(EVERYONE)
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [deletingTemplate, setDeletingTemplate] = useState<NotificationTemplate | null>(null)

  const subscriberCount = useSubscriberCount()
  const subscribers = useSubscribers()
  const templates = useTemplates()
  const sendNotification = useSendNotification()
  const createTemplate = useCreateTemplate()
  const deleteTemplate = useDeleteTemplate()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !body.trim()) return
    sendNotification.mutate(
      {
        title: title.trim(),
        body: body.trim(),
        url: url.trim() || undefined,
        userId: recipientId || undefined,
      },
      {
        onSuccess: () => {
          setTitle('')
          setBody('')
          setUrl('')
          setRecipientId(EVERYONE)
        },
      }
    )
  }

  function handleUseTemplate(template: NotificationTemplate) {
    setTitle(template.title)
    setBody(template.body)
    setUrl(template.url ?? '')
  }

  function handleSaveTemplate() {
    if (!templateName.trim() || !title.trim() || !body.trim()) return
    createTemplate.mutate(
      { name: templateName.trim(), title: title.trim(), body: body.trim(), url: url.trim() || undefined },
      { onSuccess: () => setSaveTemplateOpen(false) }
    )
  }

  const selectedSubscriber = subscribers.data?.find((s) => s.id === recipientId)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Push Notifications"
        description="Send a browser push notification to everyone, or to a specific person, who has enabled notifications on the storefront."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compose Form */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-2 flex flex-col gap-4 rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-black"
        >
          <Select
            label="Send to"
            value={recipientId}
            onChange={(e) => setRecipientId(e.target.value)}
          >
            <option value={EVERYONE}>Everyone ({subscriberCount.data ?? 0} subscriber{subscriberCount.data === 1 ? '' : 's'})</option>
            {subscribers.data?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name ? `${s.name} (${s.email})` : s.email}
              </option>
            ))}
          </Select>
          {recipientId && !selectedSubscriber && (
            <p className="-mt-2 text-xs text-black/40 dark:text-white/40">Loading recipient…</p>
          )}

          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="New drop just landed"
            maxLength={100}
            required
          />
          <Textarea
            label="Message"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Check out the new oversized collection before it sells out."
            rows={3}
            maxLength={500}
            required
          />
          <Input
            label="Link (optional)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://your-storefront-domain.com/category/oversized"
            type="url"
            hint="Opens this page when the notification is clicked. Defaults to the homepage."
          />
          <div className="flex items-center justify-between pt-2">
            <span className="flex items-center gap-1.5 text-xs text-black/50 dark:text-white/50">
              <HugeiconsIcon icon={UserGroupIcon} size={14} />
              {recipientId
                ? selectedSubscriber?.email ?? '1 recipient'
                : `${subscriberCount.data ?? 0} subscriber${subscriberCount.data === 1 ? '' : 's'}`}
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setSaveTemplateOpen(true)}
                disabled={!title.trim() || !body.trim()}
              >
                Save as Template
              </Button>
              <Button type="submit" disabled={sendNotification.isPending || !title.trim() || !body.trim()}>
                {sendNotification.isPending ? 'Sending…' : 'Send Notification'}
              </Button>
            </div>
          </div>
        </form>

        {/* Preview + Templates */}
        <div className="flex flex-col gap-6">
          <div className="rounded-xl border border-black/10 bg-gray-50/60 p-5 dark:border-white/10 dark:bg-white/5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-black/40 dark:text-white/40">
              Preview
            </p>
            <div className="rounded-lg border border-black/10 bg-white p-3.5 shadow-sm dark:border-white/10 dark:bg-black">
              <div className="flex items-start gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black">
                  <HugeiconsIcon icon={Megaphone01Icon} size={16} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-black dark:text-white">
                    {title.trim() || 'Notification title'}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-black/60 dark:text-white/60">
                    {body.trim() || 'Your message will appear here.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-black">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-black/40 dark:text-white/40">
              Templates
            </p>
            {templates.isLoading ? (
              <p className="text-xs text-black/50 dark:text-white/50">Loading…</p>
            ) : !templates.data || templates.data.length === 0 ? (
              <p className="text-xs text-black/40 dark:text-white/40">
                No templates yet — fill out the form and save it as a template.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {templates.data.map((template) => (
                  <li
                    key={template.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-black/10 px-3 py-2 dark:border-white/10"
                  >
                    <button
                      type="button"
                      onClick={() => handleUseTemplate(template)}
                      className="min-w-0 flex-1 text-left cursor-pointer"
                      title="Load this template into the form"
                    >
                      <p className="truncate text-xs font-semibold text-black dark:text-white">{template.name}</p>
                      <p className="truncate text-[11px] text-black/50 dark:text-white/50">{template.title}</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingTemplate(template)}
                      className="shrink-0 rounded p-1 text-black/40 hover:bg-rose-500/10 hover:text-rose-600 dark:text-white/40 dark:hover:bg-rose-500/20 dark:hover:text-rose-400"
                      title="Delete template"
                    >
                      <HugeiconsIcon icon={Delete02Icon} size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>


      {/* Save as Template Modal */}
      <Modal open={saveTemplateOpen} onClose={() => setSaveTemplateOpen(false)} title="Save as Template" widthClassName="max-w-sm">
        <div className="flex flex-col gap-4">
          <Input
            label="Template name"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="e.g. New Drop Announcement"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setSaveTemplateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate} disabled={createTemplate.isPending || !templateName.trim()}>
              {createTemplate.isPending ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deletingTemplate}
        title="Delete template"
        description={`Delete "${deletingTemplate?.name}"? This can't be undone.`}
        isLoading={deleteTemplate.isPending}
        onCancel={() => setDeletingTemplate(null)}
        onConfirm={() => {
          if (deletingTemplate) deleteTemplate.mutate(deletingTemplate.id, { onSuccess: () => setDeletingTemplate(null) })
        }}
      />
    </div>
  )
}
