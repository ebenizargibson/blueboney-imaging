'use client'
import { useState, useEffect } from 'react'
import { Stethoscope, Zap }    from 'lucide-react'
import { PageLoader, EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge, priorityVariant } from '@/components/shared/StatusBadge'
import { worklistApi }         from '@/lib/api'

interface WorklistItem {
  id:               string
  study_accession?: string
  modality_type?:   string
  priority?:        string
  tat_deadline?:    string
  ai_priority_flag?: boolean
  claimed_by?:      string
  status?:          string
}

export default function WorklistPage() {
  const [items,   setItems]   = useState<WorklistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [claiming, setClaiming] = useState<string | null>(null)

  const load = () => {
    ;(worklistApi.list({ status: 'pending', limit: 50 }) as Promise<{ data?: WorklistItem[] }>)
      .then(d => setItems(d?.data ?? []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const claim = async (id: string) => {
    setClaiming(id)
    try {
      await worklistApi.claim(id)
      load()
    } catch (e: unknown) {
      setError((e as Error).message)
    }
    setClaiming(null)
  }

  const isOverdue = (deadline?: string) => deadline && new Date(deadline) < new Date()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[var(--bb-ink)]">Radiologist Worklist</h1>
        <p className="text-[13px] text-[var(--bb-ink-muted)] mt-0.5">
          Studies awaiting interpretation — STAT first.
        </p>
      </div>

      {loading ? <PageLoader label="Loading worklist…" /> : error ? (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : items.length === 0 ? (
        <EmptyState icon={Stethoscope} title="Worklist empty" subtitle="No studies awaiting interpretation." />
      ) : (
        <div className="bg-white rounded-[14px] border border-[var(--bb-border)] shadow-[var(--shadow-sm)] overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[var(--bb-border)] text-[var(--bb-ink-muted)] text-[11px] font-semibold uppercase tracking-wide">
                <th className="text-left px-4 py-3">Accession</th>
                <th className="text-left px-4 py-3">Modality</th>
                <th className="text-left px-4 py-3">Priority</th>
                <th className="text-left px-4 py-3">TAT Deadline</th>
                <th className="text-left px-4 py-3">AI Flag</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => {
                const overdue = isOverdue(item.tat_deadline)
                return (
                  <tr key={item.id} className={`border-t border-[var(--bb-border)] transition-colors ${overdue ? 'bg-red-50' : 'hover:bg-[var(--bb-bg)]'}`}>
                    <td className="px-4 py-3 font-mono text-[11px] text-[var(--bb-ink-muted)]">
                      {item.study_accession ?? item.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3 font-medium text-[var(--bb-ink)]">{item.modality_type ?? '—'}</td>
                    <td className="px-4 py-3">
                      <StatusBadge label={item.priority ?? 'routine'} variant={priorityVariant(item.priority ?? '')} />
                    </td>
                    <td className={`px-4 py-3 text-[12px] font-medium ${overdue ? 'text-[var(--imaging-critical)]' : 'text-[var(--bb-ink-muted)]'}`}>
                      {item.tat_deadline ? new Date(item.tat_deadline).toLocaleString() : '—'}
                      {overdue && <span className="ml-1 text-[10px] font-bold">OVERDUE</span>}
                    </td>
                    <td className="px-4 py-3">
                      {item.ai_priority_flag ? (
                        <span className="flex items-center gap-1 text-[var(--imaging-accent)] text-[11px] font-semibold">
                          <Zap size={13} /> AI
                        </span>
                      ) : <span className="text-[var(--bb-ink-muted)]">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge label={item.status ?? 'pending'} variant="neutral" />
                    </td>
                    <td className="px-4 py-3">
                      {!item.claimed_by && (
                        <button
                          onClick={() => claim(item.id)}
                          disabled={claiming === item.id}
                          className="px-3 py-1.5 rounded-[6px] bg-[var(--imaging-accent)] text-white text-[11px] font-medium hover:bg-[var(--imaging-accent-hover)] disabled:opacity-50 transition-colors"
                        >
                          {claiming === item.id ? 'Claiming…' : 'Claim'}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
