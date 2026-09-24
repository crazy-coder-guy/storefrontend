import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { Input } from '../components/Input'
import { Textarea } from '../components/Textarea'
import { Button } from '../components/Button'
import { EmptyState } from '../components/EmptyState'
import { HugeiconsIcon } from '@hugeicons/react'
import { Megaphone01Icon, UserGroupIcon } from '@hugeicons/core-free-icons'
import {
  useNotificationHistory,
  useSendNotification,
  useSubscriberCount,
} from '../features/notifications/hooks/useNotifications'

export function NotificationsPage() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [url, setUrl] = useState('')
  const [page, setPage] = useState(1)

  const subscriberCount = useSubscriberCount()
  const history = useNotificationHistory(page)
  const sendNotification = useSendNotification()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !body.trim()) return
    sendNotification.mutate(
      { title: title.trim(), body: body.trim(), url: url.trim() || undefined },
      {
        onSuccess: () => {
          setTitle('')
          setBody('')
          setUrl('')
        },
      }
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Push Notifications"
        description="Send a browser push notification to everyone who has enabled notifications on the storefront."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compose Form */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-2 flex flex-col gap-4 rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-black"
        >
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
              {subscriberCount.data ?? 0} subscriber{subscriberCount.data === 1 ? '' : 's'}
            </span>
            <Button type="submit" disabled={sendNotification.isPending || !title.trim() || !body.trim()}>
              {sendNotification.isPending ? 'Sending…' : 'Send Notification'}
            </Button>
          </div>
        </form>

        {/* Live Preview */}
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
      </div>

      {/* Send History */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-black/80 dark:text-white/80">Send History</h2>
        {history.isLoading ? (
          <p className="text-sm text-black/50 dark:text-white/50">Loading…</p>
        ) : !history.data || history.data.items.length === 0 ? (
          <EmptyState title="No notifications sent yet" description="Your sent notifications will show up here." />
        ) : (
          <div className="overflow-hidden rounded-xl border border-black/10 dark:border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-white/5">
                <tr>
                  <th className="px-4 py-2.5 font-medium text-black/60 dark:text-white/60">Title</th>
                  <th className="px-4 py-2.5 font-medium text-black/60 dark:text-white/60">Message</th>
                  <th className="px-4 py-2.5 font-medium text-black/60 dark:text-white/60">Delivered</th>
                  <th className="px-4 py-2.5 font-medium text-black/60 dark:text-white/60">Failed</th>
                  <th className="px-4 py-2.5 font-medium text-black/60 dark:text-white/60">Sent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/10">
                {history.data.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-2.5 font-medium text-black dark:text-white">{item.title}</td>
                    <td className="max-w-xs truncate px-4 py-2.5 text-black/70 dark:text-white/70">{item.body}</td>
                    <td className="px-4 py-2.5 text-black/70 dark:text-white/70">{item.successCount}</td>
                    <td className="px-4 py-2.5 text-black/70 dark:text-white/70">{item.failureCount}</td>
                    <td className="px-4 py-2.5 text-black/50 dark:text-white/50">
                      {new Date(item.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {history.data && history.data.meta.totalPages > 1 && (
          <div className="mt-3 flex items-center justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 text-xs"
            >
              Previous
            </Button>
            <span className="text-xs text-black/50 dark:text-white/50">
              Page {history.data.meta.page} of {history.data.meta.totalPages}
            </span>
            <Button
              variant="secondary"
              onClick={() => setPage((p) => Math.min(history.data!.meta.totalPages, p + 1))}
              disabled={page >= history.data.meta.totalPages}
              className="px-3 py-1.5 text-xs"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
