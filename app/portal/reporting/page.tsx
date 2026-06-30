'use client'
import { useState, useEffect } from 'react'
import Link                    from 'next/link'
import { FileText }            from 'lucide-react'
import { PageLoader, EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge, statusVariant } from '@/components/shared/StatusBadge'
import { reportsApi }          from '@/lib/api'

interface Report {
  id:            string
  study_accession?: string
  radiologist_name?: string
  status?:       string
  started_at?:   string
  signed_at?:    string
}

type ActiveTab = 'draft' | 'signed'

export default function ReportingPage() {
  const [reports,  setReports]  = useState<Report[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [tab,      setTab]      = useState<ActiveTab>('draft')

  useEffect(() => {
    setLoading(true)
    ;(reportsApi.list({ status: tab, limit: 50 }) as Promise<{ data?: Report[] }>)
      .then(d => setReports(d?.data ?? []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [tab])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[var(--bb-ink)]">Reporting</h1>
        <p className="text-[13px] text-[var(--bb-ink-muted)] mt-0.5">Draft and signed radiology reports.</p>
      </div>

      <div className="flex gap-1 mb-6 bg-white border border-[var(--bb-border)] rounded-[10px] p-1 w-fit">
        {(['draft', 'signed'] as ActiveTab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-[8px] text-[12px] font-medium capitalize transition-all ${
              tab === t ? 'bg-[var(--imaging-accent)] text-white' : 'text-[var(--bb-ink-muted)] hover:text-[var(--bb-ink)]'
            }`}>{t === 'draft' ? 'Draft Reports' : 'Signed Reports'}</button>
        ))}
      </div>

      {loading ? <PageLoader label="Loading reports…" /> : error ? (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : reports.length === 0 ? (
        <EmptyState icon={FileText} title={`No ${tab} reports`} subtitle={`No ${tab} reports found.`} />
      ) : (
        <div className="bg-white rounded-[14px] border border-[var(--bb-border)] shadow-[var(--shadow-sm)] overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[var(--bb-border)] text-[var(--bb-ink-muted)] text-[11px] font-semibold uppercase tracking-wide">
                <th className="text-left px-4 py-3">Accession</th>
                <th className="text-left px-4 py-3">Radiologist</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Started</th>
                {tab === 'signed' && <th className="text-left px-4 py-3">Signed</th>}
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {reports.map(r => (
                <tr key={r.id} className="border-t border-[var(--bb-border)] hover:bg-[var(--bb-bg)] transition-colors">
                  <td className="px-4 py-3 font-mono text-[11px] text-[var(--bb-ink-muted)]">
                    {r.study_accession ?? r.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="px-4 py-3 font-medium text-[var(--bb-ink)]">{r.radiologist_name ?? '—'}</td>
                  <td className="px-4 py-3">
                    <StatusBadge label={r.status ?? 'draft'} variant={statusVariant(r.status ?? '')} />
                  </td>
                  <td className="px-4 py-3 text-[var(--bb-ink-muted)]">
                    {r.started_at ? new Date(r.started_at).toLocaleDateString() : '—'}
                  </td>
                  {tab === 'signed' && (
                    <td className="px-4 py-3 text-[var(--bb-ink-muted)]">
                      {r.signed_at ? new Date(r.signed_at).toLocaleDateString() : '—'}
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <Link href={`/portal/reporting/${r.id}`} className="text-[var(--imaging-accent)] hover:underline text-[12px] font-medium">
                      {tab === 'draft' ? 'Edit' : 'View'}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
