import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Add01Icon } from '@hugeicons/core-free-icons'
import { PageHeader } from '../components/PageHeader'
import { Table } from '../components/Table'
import { Pagination } from '../components/Pagination'
import { SkeletonRows } from '../components/Skeleton'
import { ErrorState } from '../components/ErrorState'
import { EmptyState } from '../components/EmptyState'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { Button } from '../components/Button'
import { Modal } from '../components/Modal'
import { Input } from '../components/Input'
import {
  useNewsletterSubscribers,
  useDeleteSubscriber,
  useCampaigns,
  useCreateCampaign,
} from '../hooks/useNewsletterSubscribers'
import { formatDate } from '../utils/formatDate'
import { DEFAULT_PAGE_SIZE } from '../utils/constants'
import type { NewsletterSubscriber, Campaign } from '../services/newsletter.service'

const CAMPAIGN_STATUS_LABEL: Record<string, string> = {
  draft: 'Draft',
  sent: 'Sent',
  queued: 'Queued',
  in_process: 'Sending…',
  suspended: 'Suspended',
}

function ComposeNewsletterModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [subject, setSubject] = useState('')
  const [htmlContent, setHtmlContent] = useState('')
  const [mode, setMode] = useState<'now' | 'schedule'>('now')
  const [scheduledAt, setScheduledAt] = useState('')
  const createMutation = useCreateCampaign()

  function reset() {
    setSubject('')
    setHtmlContent('')
    setMode('now')
    setScheduledAt('')
  }

  function handleClose() {
    if (createMutation.isPending) return
    reset()
    onClose()
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!subject.trim() || !htmlContent.trim()) return
    if (mode === 'schedule' && !scheduledAt) return

    createMutation.mutate(
      {
        subject: subject.trim(),
        htmlContent,
        sendNow: mode === 'now',
        scheduledAt: mode === 'schedule' ? new Date(scheduledAt).toISOString() : undefined,
      },
      { onSuccess: handleClose }
    )
  }

  return (
    <Modal open={open} onClose={handleClose} title="Compose Newsletter" widthClassName="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="New arrivals just dropped"
          required
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-black/80 dark:text-white/80">Email Body (HTML)</label>
          <textarea
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value)}
            required
            rows={10}
            placeholder="<h1>Hello!</h1><p>Check out what's new...</p>"
            className="rounded-lg border border-black/15 bg-white px-3 py-2 font-mono text-xs text-black outline-none transition-colors placeholder:text-black/30 focus:border-black/40 dark:border-white/20 dark:bg-black dark:text-white dark:placeholder:text-white/30 dark:focus:border-white/40"
          />
          <p className="text-xs text-black/50 dark:text-white/50">
            Sent to everyone on the newsletter list via Brevo. Basic HTML tags are supported.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={mode === 'now'} onChange={() => setMode('now')} />
              Send now
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={mode === 'schedule'} onChange={() => setMode('schedule')} />
              Schedule for later
            </label>
          </div>
          {mode === 'schedule' && (
            <Input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              required
            />
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={createMutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending
              ? 'Please wait…'
              : mode === 'now'
                ? 'Send Now'
                : 'Schedule'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export function NewsletterPage() {
  const [page, setPage] = useState(1)
  const [deleting, setDeleting] = useState<NewsletterSubscriber | null>(null)
  const [composeOpen, setComposeOpen] = useState(false)

  const { data, isLoading, isError, error, refetch } = useNewsletterSubscribers({
    page,
    limit: DEFAULT_PAGE_SIZE,
  })
  const deleteMutation = useDeleteSubscriber()
  const { data: campaigns = [], isLoading: campaignsLoading } = useCampaigns()

  function handleConfirmDelete() {
    if (!deleting) return
    deleteMutation.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
  }

  return (
    <div className="space-y-10">
      <PageHeader
        title="Newsletter"
        description="Emails collected from the storefront footer's 'Stay Connected' signup — compose and send campaigns via Brevo."
        actions={
          <Button onClick={() => setComposeOpen(true)}>
            <HugeiconsIcon icon={Add01Icon} size={16} />
            <span>Compose Newsletter</span>
          </Button>
        }
      />

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-black/70 dark:text-white/70">Sent & Scheduled Campaigns</h2>
        <Table<Campaign>
          rowKey={(row) => String(row.id)}
          data={campaigns}
          isLoading={campaignsLoading}
          loadingRows={<SkeletonRows cols={4} />}
          emptyContent={
            <EmptyState title="No campaigns yet" description="Compose your first newsletter to send to all subscribers." />
          }
          columns={[
            {
              header: 'Subject',
              key: 'subject',
              className: 'min-w-[220px]',
              render: (row) => <span className="font-medium">{row.subject || row.name}</span>,
            },
            {
              header: 'Status',
              key: 'status',
              className: 'min-w-[100px]',
              render: (row) => CAMPAIGN_STATUS_LABEL[row.status] ?? row.status,
            },
            {
              header: 'Sent',
              key: 'sentDate',
              className: 'min-w-[130px]',
              render: (row) => (row.statistics?.globalStats?.sent ?? 0),
            },
            {
              header: 'Date',
              key: 'createdAt',
              className: 'min-w-[130px]',
              render: (row) => formatDate(row.sentDate ?? row.createdAt),
            },
          ]}
        />
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-black/70 dark:text-white/70">Subscribers</h2>
        <Table<NewsletterSubscriber>
          rowKey={(row) => row.id}
          data={data?.items ?? []}
          isLoading={isLoading}
          loadingRows={<SkeletonRows cols={3} />}
          isError={isError}
          errorContent={<ErrorState error={error} onRetry={() => refetch()} />}
          emptyContent={
            <EmptyState
              title="No subscribers yet"
              description="Emails appear here once shoppers sign up from the storefront footer."
            />
          }
          columns={[
            {
              header: 'Email',
              key: 'email',
              className: 'min-w-[220px]',
              render: (row) => <span className="font-medium">{row.email}</span>,
            },
            {
              header: 'Subscribed On',
              key: 'createdAt',
              className: 'min-w-[140px]',
              render: (row) => formatDate(row.createdAt),
            },
            {
              header: '',
              key: 'actions',
              className: 'min-w-[80px] text-right',
              render: (row) => (
                <Button variant="danger" className="px-3 py-1.5 text-xs" onClick={() => setDeleting(row)}>
                  Remove
                </Button>
              ),
            },
          ]}
        />

        {data && <Pagination meta={data.meta} onPageChange={setPage} />}
      </div>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Remove this subscriber?"
        description={`${deleting?.email ?? ''} will stop being counted as a newsletter subscriber.`}
        confirmLabel="Remove"
        isLoading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleting(null)}
      />

      <ComposeNewsletterModal open={composeOpen} onClose={() => setComposeOpen(false)} />
    </div>
  )
}
