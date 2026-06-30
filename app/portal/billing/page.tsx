'use client'
import { useState, useEffect } from 'react'
import { Receipt }             from 'lucide-react'
import { PageLoader, EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge, statusVariant } from '@/components/shared/StatusBadge'
import { claimsApi }           from '@/lib/api'

interface Claim {
  id:              string
  study_accession?: string
  billed_amount?:  number
  claim_status?:   string
  insurer?:        string
  created_at?:     string
}

const TABS = ['all', 'draft', 'submitted', 'approved', 'denied', 'appealed'] as const
type Tab = typeof TABS[number]

export default function BillingPage() {
  const [claims,  setClaims]  = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [tab,     setTab]     = useState<Tab>('all')
  const [submitting, setSubmitting] = useState<string | null>(null)

  const load = () => {
    const params = tab === 'all' ? { limit: 50 } : { limit: 50, status: tab }
    ;(claimsApi.list(params) as Promise<{ data?: Claim[] }>)
      .then(d => setClaims(d?.data ?? []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { setLoading(true); load() }, [tab])

  const submitClaim = async (id: string) => {
    setSubmitting(id)
    try {
      await claimsApi.submit(id)
      load()
    } catch (e: unknown) { setError((e as Error).message) }
    setSubmitting(null)
  }

  const filtered = tab === 'all' ? claims : claims.filter(c => c.claim_status === tab)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[var(--bb-ink)]">Billing & Claims</h1>
        <p className="text-[13px] text-[var(--bb-ink-muted)] mt-0.5">Insurance claims for imaging studies.</p>
      </div>

      <div className="flex flex-wrap gap-1 mb-6 bg-white border border-[var(--bb-border)] rounded-[10px] p-1 w-fit">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-[8px] text-[12px] font-medium capitalize transition-all ${
              tab === t ? 'bg-[var(--imaging-accent)] text-white' : 'text-[var(--bb-ink-muted)] hover:text-[var(--bb-ink)]'
            }`}>{t}</button>
        ))}
      </div>

      {loading ? <PageLoader label="Loading claims…" /> : error ? (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Receipt} title="No claims" subtitle={`No ${tab} claims found.`} />
      ) : (
        <div className="bg-white rounded-[14px] border border-[var(--bb-border)] shadow-[var(--shadow-sm)] overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[var(--bb-border)] text-[var(--bb-ink-muted)] text-[11px] font-semibold uppercase tracking-wide">
                <th className="text-left px-4 py-3">Study</th>
                <th className="text-left px-4 py-3">Insurer</th>
                <th className="text-right px-4 py-3">Billed Amount</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(claim => (
                <tr key={claim.id} className="border-t border-[var(--bb-border)] hover:bg-[var(--bb-bg)] transition-colors">
                  <td className="px-4 py-3 font-mono text-[11px] text-[var(--bb-ink-muted)]">
                    {claim.study_accession ?? claim.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="px-4 py-3 font-medium text-[var(--bb-ink)]">{claim.insurer ?? '—'}</td>
                  <td className="px-4 py-3 text-right font-semibold text-[var(--bb-ink)]">
                    {claim.billed_amount != null ? `$${claim.billed_amount.toLocaleString()}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge label={claim.claim_status ?? 'draft'} variant={statusVariant(claim.claim_status ?? '')} />
                  </td>
                  <td className="px-4 py-3 text-[var(--bb-ink-muted)]">
                    {claim.created_at ? new Date(claim.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {claim.claim_status === 'draft' && (
                      <button
                        onClick={() => submitClaim(claim.id)}
                        disabled={submitting === claim.id}
                        className="px-3 py-1.5 rounded-[6px] bg-[var(--imaging-accent)] text-white text-[11px] font-medium hover:bg-[var(--imaging-accent-hover)] disabled:opacity-50 transition-colors"
                      >
                        {submitting === claim.id ? 'Submitting…' : 'Submit'}
                      </button>
                    )}
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
