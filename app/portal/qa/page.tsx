'use client'
import { useState, useEffect } from 'react'
import { ClipboardCheck }      from 'lucide-react'
import { PageLoader, EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge }         from '@/components/shared/StatusBadge'
import { qaApi, doseApi }      from '@/lib/api'

interface ImageReview {
  id:               string
  study_accession?: string
  overall_quality?: string
  repeat_reason?:   string
  reviewed_at?:     string
}

interface PeerReview {
  id:                    string
  original_radiologist?: string
  reviewer?:             string
  concordance?:          string
  reviewed_at?:          string
}

interface DoseSummary {
  total_studies?:  number
  above_drl?:      number
  within_drl?:     number
  drl_compliance?: number
}

type Tab = 'image' | 'peer' | 'dose'

function qualityVariant(q?: string) {
  if (q === 'excellent' || q === 'good') return 'success' as const
  if (q === 'acceptable') return 'accent' as const
  if (q === 'poor') return 'warning' as const
  if (q === 'repeat_required') return 'danger' as const
  return 'neutral' as const
}

function concordanceVariant(c?: string) {
  if (c === 'concordant') return 'success' as const
  if (c === 'minor_discrepancy') return 'warning' as const
  if (c === 'major_discrepancy') return 'danger' as const
  return 'neutral' as const
}

export default function QAPage() {
  const [tab,          setTab]          = useState<Tab>('image')
  const [imageReviews, setImageReviews] = useState<ImageReview[]>([])
  const [peerReviews,  setPeerReviews]  = useState<PeerReview[]>([])
  const [doseSummary,  setDoseSummary]  = useState<DoseSummary | null>(null)
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    if (tab === 'image') {
      ;(qaApi.listImageReviews({ limit: 50 }) as Promise<{ data?: ImageReview[] }>)
        .then(d => setImageReviews(d?.data ?? []))
        .catch(e => setError(e.message))
        .finally(() => setLoading(false))
    } else if (tab === 'peer') {
      ;(qaApi.listPeerReviews({ limit: 50 }) as Promise<{ data?: PeerReview[] }>)
        .then(d => setPeerReviews(d?.data ?? []))
        .catch(e => setError(e.message))
        .finally(() => setLoading(false))
    } else {
      ;(doseApi.summary() as Promise<{ data?: DoseSummary }>)
        .then(d => setDoseSummary(d?.data ?? null))
        .catch(e => setError(e.message))
        .finally(() => setLoading(false))
    }
  }, [tab])

  const TABS: { key: Tab; label: string }[] = [
    { key: 'image', label: 'Image QA' },
    { key: 'peer',  label: 'Peer Review' },
    { key: 'dose',  label: 'Dose Monitoring' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[var(--bb-ink)]">Quality Assurance</h1>
        <p className="text-[13px] text-[var(--bb-ink-muted)] mt-0.5">Image quality reviews, peer reviews, and dose monitoring.</p>
      </div>

      <div className="flex gap-1 mb-6 bg-white border border-[var(--bb-border)] rounded-[10px] p-1 w-fit">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 rounded-[8px] text-[12px] font-medium transition-all ${
              tab === t.key ? 'bg-[var(--imaging-accent)] text-white' : 'text-[var(--bb-ink-muted)] hover:text-[var(--bb-ink)]'
            }`}>{t.label}</button>
        ))}
      </div>

      {loading ? <PageLoader label="Loading QA data…" /> : error ? (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : tab === 'image' ? (
        imageReviews.length === 0 ? (
          <EmptyState icon={ClipboardCheck} title="No image reviews" subtitle="No image quality reviews found." />
        ) : (
          <div className="bg-white rounded-[14px] border border-[var(--bb-border)] shadow-[var(--shadow-sm)] overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[var(--bb-border)] text-[var(--bb-ink-muted)] text-[11px] font-semibold uppercase tracking-wide">
                  <th className="text-left px-4 py-3">Study</th>
                  <th className="text-left px-4 py-3">Quality</th>
                  <th className="text-left px-4 py-3">Repeat Reason</th>
                  <th className="text-left px-4 py-3">Reviewed</th>
                </tr>
              </thead>
              <tbody>
                {imageReviews.map(r => (
                  <tr key={r.id} className="border-t border-[var(--bb-border)] hover:bg-[var(--bb-bg)] transition-colors">
                    <td className="px-4 py-3 font-mono text-[11px] text-[var(--bb-ink-muted)]">
                      {r.study_accession ?? r.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge label={r.overall_quality ?? '—'} variant={qualityVariant(r.overall_quality)} />
                    </td>
                    <td className="px-4 py-3 text-[var(--bb-ink-muted)]">{r.repeat_reason ?? '—'}</td>
                    <td className="px-4 py-3 text-[var(--bb-ink-muted)]">
                      {r.reviewed_at ? new Date(r.reviewed_at).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : tab === 'peer' ? (
        peerReviews.length === 0 ? (
          <EmptyState icon={ClipboardCheck} title="No peer reviews" subtitle="No peer reviews found." />
        ) : (
          <div className="bg-white rounded-[14px] border border-[var(--bb-border)] shadow-[var(--shadow-sm)] overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[var(--bb-border)] text-[var(--bb-ink-muted)] text-[11px] font-semibold uppercase tracking-wide">
                  <th className="text-left px-4 py-3">Original Radiologist</th>
                  <th className="text-left px-4 py-3">Reviewer</th>
                  <th className="text-left px-4 py-3">Concordance</th>
                  <th className="text-left px-4 py-3">Reviewed</th>
                </tr>
              </thead>
              <tbody>
                {peerReviews.map(r => (
                  <tr key={r.id} className="border-t border-[var(--bb-border)] hover:bg-[var(--bb-bg)] transition-colors">
                    <td className="px-4 py-3 font-medium text-[var(--bb-ink)]">{r.original_radiologist ?? '—'}</td>
                    <td className="px-4 py-3 text-[var(--bb-ink-muted)]">{r.reviewer ?? '—'}</td>
                    <td className="px-4 py-3">
                      <StatusBadge label={r.concordance ?? '—'} variant={concordanceVariant(r.concordance)} />
                    </td>
                    <td className="px-4 py-3 text-[var(--bb-ink-muted)]">
                      {r.reviewed_at ? new Date(r.reviewed_at).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Studies (30d)', value: doseSummary?.total_studies ?? 0, color: 'text-[var(--bb-ink)]' },
            { label: 'Within DRL', value: doseSummary?.within_drl ?? 0, color: 'text-[var(--imaging-success)]' },
            { label: 'Above DRL', value: doseSummary?.above_drl ?? 0, color: 'text-[var(--imaging-critical)]' },
          ].map(kpi => (
            <div key={kpi.label} className="bg-white rounded-[14px] border border-[var(--bb-border)] shadow-[var(--shadow-sm)] p-5">
              <p className={`text-[32px] font-bold ${kpi.color}`}>{kpi.value}</p>
              <p className="text-[12px] font-semibold text-[var(--bb-ink)] mt-1">{kpi.label}</p>
            </div>
          ))}
          {doseSummary?.drl_compliance != null && (
            <div className="bg-white rounded-[14px] border border-[var(--bb-border)] shadow-[var(--shadow-sm)] p-5">
              <p className={`text-[32px] font-bold ${doseSummary.drl_compliance >= 90 ? 'text-[var(--imaging-success)]' : 'text-[var(--imaging-warning)]'}`}>
                {doseSummary.drl_compliance}%
              </p>
              <p className="text-[12px] font-semibold text-[var(--bb-ink)] mt-1">DRL Compliance</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
