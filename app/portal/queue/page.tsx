'use client'
import { useState, useEffect } from 'react'
import Link                    from 'next/link'
import { Layers }              from 'lucide-react'
import { PageLoader, EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge, priorityVariant } from '@/components/shared/StatusBadge'
import { studiesApi }          from '@/lib/api'

interface Study {
  id:             string
  accession_no?:  string
  modality_type?: string
  status?:        string
  priority?:      string
  body_part?:     string
}

type Column = 'scheduled' | 'in_progress' | 'acquired' | 'interpreting' | 'reported'

const COLUMNS: { key: Column; label: string; color: string }[] = [
  { key: 'scheduled',    label: 'Scheduled',    color: '#64748B' },
  { key: 'in_progress',  label: 'In Progress',  color: '#F59E0B' },
  { key: 'acquired',     label: 'Acquired',     color: '#0EA5E9' },
  { key: 'interpreting', label: 'Interpreting', color: '#8B5CF6' },
  { key: 'reported',     label: 'Reported',     color: '#10B981' },
]

export default function QueuePage() {
  const [studies, setStudies] = useState<Study[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    ;(studiesApi.list({ limit: 100 }) as Promise<{ data?: Study[] }>)
      .then(d => setStudies(d?.data ?? []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader label="Loading imaging queue…" />
  if (error) return (
    <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
  )

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[var(--bb-ink)]">Imaging Queue</h1>
        <p className="text-[13px] text-[var(--bb-ink-muted)] mt-0.5">Studies by workflow status.</p>
      </div>

      {studies.length === 0 ? (
        <EmptyState icon={Layers} title="Queue is empty" subtitle="No studies in the system." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto">
          {COLUMNS.map(col => {
            const colStudies = studies.filter(s => s.status === col.key)
            return (
              <div key={col.key} className="flex flex-col min-w-[200px]">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: col.color }} />
                  <span className="text-[12px] font-bold text-[var(--bb-ink)]">{col.label}</span>
                  <span className="ml-auto text-[11px] font-medium text-[var(--bb-ink-muted)]">{colStudies.length}</span>
                </div>
                <div className="space-y-2">
                  {colStudies.length === 0 ? (
                    <div className="rounded-[10px] border border-dashed border-[var(--bb-border)] p-4 text-center">
                      <p className="text-[11px] text-[var(--bb-ink-muted)]">Empty</p>
                    </div>
                  ) : colStudies.map(study => (
                    <Link key={study.id} href={`/portal/studies/${study.id}`}>
                      <div className="bg-white rounded-[10px] border border-[var(--bb-border)] p-3 hover:border-[var(--imaging-accent)] transition-all cursor-pointer">
                        <p className="text-[11px] font-mono text-[var(--bb-ink-muted)] mb-1">
                          {study.accession_no ?? study.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="text-[12px] font-semibold text-[var(--bb-ink)] mb-1">{study.modality_type ?? '—'}</p>
                        {study.body_part && (
                          <p className="text-[11px] text-[var(--bb-ink-muted)] mb-2">{study.body_part}</p>
                        )}
                        <StatusBadge label={study.priority ?? 'routine'} variant={priorityVariant(study.priority ?? '')} />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
