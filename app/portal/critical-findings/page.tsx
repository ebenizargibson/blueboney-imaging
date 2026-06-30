'use client'
import { useState, useEffect } from 'react'
import { AlertTriangle }       from 'lucide-react'
import { PageLoader, EmptyState } from '@/components/shared/EmptyState'
import { criticalApi }         from '@/lib/api'

interface CriticalFinding {
  id:                    string
  finding_type?:         string
  severity?:             string
  description?:          string
  notification_deadline?: string
  status?:               string
  acknowledged_at?:      string
  study_accession?:      string
}

type Severity = 'life_threatening' | 'urgent' | 'significant_unexpected' | 'incidental'

const SEVERITY_CONFIG: Record<Severity, { label: string; bg: string; text: string; border: string }> = {
  life_threatening:       { label: 'Life Threatening',    bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200' },
  urgent:                 { label: 'Urgent',              bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200' },
  significant_unexpected: { label: 'Significant',         bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200' },
  incidental:             { label: 'Incidental',          bg: 'bg-gray-50',   text: 'text-gray-700',   border: 'border-gray-200' },
}

export default function CriticalFindingsPage() {
  const [findings, setFindings] = useState<CriticalFinding[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [actionId, setActionId] = useState<string | null>(null)
  const [notifyNote, setNotifyNote] = useState('')
  const [notifyAction, setNotifyAction] = useState<'notify' | 'acknowledge' | 'escalate' | null>(null)

  const load = () => {
    ;(criticalApi.list({ limit: 50 }) as Promise<{ data?: CriticalFinding[] }>)
      .then(d => setFindings(d?.data ?? []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const isOverdue = (deadline?: string) => deadline && new Date(deadline) < new Date()

  const minutesUntil = (deadline?: string) => {
    if (!deadline) return null
    const diff = Math.round((new Date(deadline).getTime() - Date.now()) / 60000)
    return diff
  }

  const executeAction = async () => {
    if (!actionId || !notifyAction) return
    try {
      if (notifyAction === 'notify')      await criticalApi.recordNotify(actionId, { note: notifyNote })
      if (notifyAction === 'acknowledge') await criticalApi.acknowledge(actionId, { note: notifyNote })
      if (notifyAction === 'escalate')    await criticalApi.escalate(actionId, { note: notifyNote })
      setActionId(null)
      setNotifyNote('')
      setNotifyAction(null)
      load()
    } catch (e: unknown) { setError((e as Error).message) }
  }

  if (loading) return <PageLoader label="Loading critical findings…" />

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[var(--bb-ink)]">Critical Findings</h1>
        <p className="text-[13px] text-[var(--bb-ink-muted)] mt-0.5">
          Time-sensitive findings requiring immediate clinician notification.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">{error}</div>
      )}

      {findings.length === 0 ? (
        <EmptyState icon={AlertTriangle} title="No critical findings" subtitle="No unresolved critical findings." />
      ) : (
        <div className="space-y-4">
          {findings.map(f => {
            const sev   = (f.severity ?? 'incidental') as Severity
            const cfg   = SEVERITY_CONFIG[sev] ?? SEVERITY_CONFIG.incidental
            const overdue = isOverdue(f.notification_deadline)
            const mins    = minutesUntil(f.notification_deadline)

            return (
              <div key={f.id} className={`rounded-[14px] border-2 p-5 ${overdue ? 'border-red-400 bg-red-50' : `${cfg.border} ${cfg.bg}`}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <AlertTriangle size={18} className={cfg.text} />
                    <div>
                      <span className={`text-[11px] font-bold uppercase tracking-wide ${cfg.text}`}>{cfg.label}</span>
                      {f.study_accession && (
                        <span className="ml-2 text-[11px] text-[var(--bb-ink-muted)]">Study: {f.study_accession}</span>
                      )}
                    </div>
                  </div>
                  {f.notification_deadline && (
                    <div className={`text-right ${overdue ? 'text-red-600' : 'text-[var(--bb-ink-muted)]'}`}>
                      {overdue ? (
                        <span className="text-[11px] font-bold text-red-600">OVERDUE</span>
                      ) : (
                        <span className="text-[11px]">{mins != null ? `${mins} min remaining` : ''}</span>
                      )}
                      <p className="text-[10px]">Deadline: {new Date(f.notification_deadline).toLocaleTimeString()}</p>
                    </div>
                  )}
                </div>

                {f.description && (
                  <p className="text-[13px] text-[var(--bb-ink)] mb-4">{f.description}</p>
                )}

                <div className="flex flex-wrap gap-2">
                  {f.status !== 'notified' && f.status !== 'acknowledged' && (
                    <button
                      onClick={() => { setActionId(f.id); setNotifyAction('notify') }}
                      className="px-3 py-1.5 rounded-[6px] bg-[var(--imaging-accent)] text-white text-[11px] font-semibold hover:bg-[var(--imaging-accent-hover)] transition-colors"
                    >
                      Record Notification
                    </button>
                  )}
                  {f.status !== 'acknowledged' && (
                    <button
                      onClick={() => { setActionId(f.id); setNotifyAction('acknowledge') }}
                      className="px-3 py-1.5 rounded-[6px] bg-[var(--imaging-success)] text-white text-[11px] font-semibold hover:opacity-90 transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}
                  <button
                    onClick={() => { setActionId(f.id); setNotifyAction('escalate') }}
                    className="px-3 py-1.5 rounded-[6px] border border-[var(--imaging-critical)] text-[var(--imaging-critical)] text-[11px] font-semibold hover:bg-[var(--imaging-danger-bg)] transition-colors"
                  >
                    Escalate
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Action modal */}
      {actionId && notifyAction && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[16px] w-full max-w-[500px] p-6 shadow-[var(--shadow-xl)]">
            <h3 className="text-[16px] font-bold text-[var(--bb-ink)] mb-2 capitalize">
              {notifyAction === 'notify' ? 'Record Notification' : notifyAction === 'acknowledge' ? 'Acknowledge Finding' : 'Escalate Finding'}
            </h3>
            <p className="text-[13px] text-[var(--bb-ink-muted)] mb-4">Add a note (optional).</p>
            <textarea
              rows={3}
              value={notifyNote}
              onChange={e => setNotifyNote(e.target.value)}
              placeholder="Note…"
              className="w-full px-3 py-2.5 rounded-[10px] border border-[var(--bb-border)] text-[13px] text-[var(--bb-ink)] resize-none focus:outline-none focus:border-[var(--imaging-accent)] focus:ring-1 focus:ring-[var(--imaging-accent)]/30 transition-all mb-4"
            />
            <div className="flex gap-2">
              <button onClick={executeAction} className="flex-1 py-2 rounded-[8px] bg-[var(--imaging-accent)] text-white text-[13px] font-medium">
                Confirm
              </button>
              <button onClick={() => { setActionId(null); setNotifyNote(''); setNotifyAction(null) }}
                className="flex-1 py-2 rounded-[8px] border border-[var(--bb-border)] text-[13px] text-[var(--bb-ink-muted)] hover:bg-[var(--bb-bg2)]">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
