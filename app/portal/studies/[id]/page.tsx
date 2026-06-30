'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link                    from 'next/link'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { PageLoader }          from '@/components/shared/EmptyState'
import { StatusBadge, statusVariant, priorityVariant } from '@/components/shared/StatusBadge'
import { studiesApi }          from '@/lib/api'

interface Study {
  id:               string
  accession_no?:    string
  modality_type?:   string
  body_part?:       string
  status?:          string
  priority?:        string
  acquired_at?:     string
  pacs_study_url?:  string
  uhr_patient_id?:  string
  laterality?:      string
  series_count?:    number
}

interface Series {
  id:            string
  series_number?: number
  description?:  string
  image_count?:  number
  modality?:     string
}

export default function StudyDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [study,   setStudy]   = useState<Study | null>(null)
  const [series,  setSeries]  = useState<Series[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [actionLoading, setActionLoading] = useState('')

  useEffect(() => {
    Promise.all([
      studiesApi.get(params.id) as Promise<{ data?: Study }>,
      studiesApi.getSeries(params.id) as Promise<{ data?: Series[] }>,
    ])
      .then(([s, sr]) => { setStudy(s?.data ?? null); setSeries(sr?.data ?? []) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [params.id])

  const completeStudy = async () => {
    setActionLoading('complete')
    try {
      await studiesApi.complete(params.id)
      const d = await studiesApi.get(params.id) as { data?: Study }
      setStudy(d?.data ?? null)
    } catch (e: unknown) { setError((e as Error).message) }
    setActionLoading('')
  }

  if (loading) return <PageLoader label="Loading study…" />
  if (error) return (
    <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
  )
  if (!study) return null

  return (
    <div className="max-w-[1000px]">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-[13px] text-[var(--bb-ink-muted)] hover:text-[var(--bb-ink)] mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Studies
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[18px] font-bold text-[var(--bb-ink)]">
            {study.accession_no ?? study.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-[12px] text-[var(--bb-ink-muted)] mt-0.5">{study.modality_type} — {study.body_part ?? 'No body part'}</p>
        </div>
        <div className="flex gap-2">
          <StatusBadge label={study.priority ?? 'routine'} variant={priorityVariant(study.priority ?? '')} />
          <StatusBadge label={study.status ?? 'scheduled'} variant={statusVariant(study.status ?? '')} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-[14px] border border-[var(--bb-border)] shadow-[var(--shadow-sm)] p-6">
          <h2 className="text-[14px] font-bold text-[var(--bb-ink)] mb-4">Study Details</h2>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-[13px]">
            <div>
              <dt className="text-[11px] text-[var(--bb-ink-muted)] uppercase tracking-wide font-medium mb-0.5">Patient</dt>
              <dd className="font-mono text-[11px] text-[var(--bb-ink-muted)]">{study.uhr_patient_id ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-[var(--bb-ink-muted)] uppercase tracking-wide font-medium mb-0.5">Laterality</dt>
              <dd className="font-medium text-[var(--bb-ink)]">{study.laterality ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-[var(--bb-ink-muted)] uppercase tracking-wide font-medium mb-0.5">Acquired</dt>
              <dd className="font-medium text-[var(--bb-ink)]">
                {study.acquired_at ? new Date(study.acquired_at).toLocaleString() : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] text-[var(--bb-ink-muted)] uppercase tracking-wide font-medium mb-0.5">Series Count</dt>
              <dd className="font-medium text-[var(--bb-ink)]">{study.series_count ?? series.length}</dd>
            </div>
          </dl>

          {/* Actions */}
          <div className="mt-6 pt-5 border-t border-[var(--bb-border)] flex flex-wrap gap-3">
            {study.pacs_study_url && (
              <a
                href={study.pacs_study_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-[8px] bg-[var(--imaging-primary)] text-white text-[13px] font-medium hover:bg-[var(--imaging-hover)] transition-colors"
              >
                <ExternalLink size={14} /> Open in PACS Viewer
              </a>
            )}
            {study.status === 'acquired' && (
              <button
                onClick={completeStudy}
                disabled={actionLoading === 'complete'}
                className="px-4 py-2 rounded-[8px] bg-[var(--imaging-success)] text-white text-[13px] font-medium hover:opacity-90 disabled:opacity-50 transition-colors"
              >
                {actionLoading === 'complete' ? 'Completing…' : 'Complete Study'}
              </button>
            )}
            <Link
              href={`/portal/studies/${study.id}/dose`}
              className="px-4 py-2 rounded-[8px] border border-[var(--imaging-accent)] text-[var(--imaging-accent)] text-[13px] font-medium hover:bg-[var(--imaging-accent-bg)] transition-colors"
            >
              Record Dose
            </Link>
          </div>
        </div>

        {/* Series list */}
        <div className="bg-white rounded-[14px] border border-[var(--bb-border)] shadow-[var(--shadow-sm)] p-6">
          <h2 className="text-[14px] font-bold text-[var(--bb-ink)] mb-4">Series ({series.length})</h2>
          {series.length === 0 ? (
            <p className="text-[13px] text-[var(--bb-ink-muted)]">No series available.</p>
          ) : (
            <ul className="space-y-2">
              {series.map(s => (
                <li key={s.id} className="flex items-center justify-between p-3 rounded-[8px] bg-[var(--bb-bg)]">
                  <div>
                    <p className="text-[12px] font-semibold text-[var(--bb-ink)]">
                      {s.series_number != null ? `Series ${s.series_number}` : 'Series'}
                    </p>
                    {s.description && <p className="text-[11px] text-[var(--bb-ink-muted)]">{s.description}</p>}
                  </div>
                  <span className="text-[11px] text-[var(--bb-ink-muted)]">{s.image_count ?? 0} img</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
