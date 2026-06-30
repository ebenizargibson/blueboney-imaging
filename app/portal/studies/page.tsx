'use client'
import { useState, useEffect } from 'react'
import Link                    from 'next/link'
import { Search, FileText }    from 'lucide-react'
import { PageLoader, EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge, statusVariant, priorityVariant } from '@/components/shared/StatusBadge'
import { studiesApi }          from '@/lib/api'

interface Study {
  id:             string
  accession_no?:  string
  modality_type?: string
  body_part?:     string
  status?:        string
  priority?:      string
  acquired_at?:   string
}

export default function StudiesPage() {
  const [studies,  setStudies]  = useState<Study[]>([])
  const [filtered, setFiltered] = useState<Study[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [search,   setSearch]   = useState('')

  useEffect(() => {
    ;(studiesApi.list({ limit: 50 }) as Promise<{ data?: Study[] }>)
      .then(d => { setStudies(d?.data ?? []); setFiltered(d?.data ?? []) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(
      studies.filter(s =>
        !q ||
        s.accession_no?.toLowerCase().includes(q) ||
        s.modality_type?.toLowerCase().includes(q) ||
        s.body_part?.toLowerCase().includes(q)
      )
    )
  }, [search, studies])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[var(--bb-ink)]">Studies</h1>
        <p className="text-[13px] text-[var(--bb-ink-muted)] mt-0.5">All imaging studies.</p>
      </div>

      <div className="relative mb-6 max-w-[400px]">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--bb-ink-muted)]" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by accession, modality, body part…"
          className="w-full pl-9 pr-4 py-2.5 rounded-[10px] border border-[var(--bb-border)] bg-white text-[13px] text-[var(--bb-ink)] placeholder:text-[var(--bb-ink-muted)] focus:outline-none focus:border-[var(--imaging-accent)] focus:ring-1 focus:ring-[var(--imaging-accent)]/30 transition-all"
        />
      </div>

      {loading ? <PageLoader label="Loading studies…" /> : error ? (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={FileText} title="No studies found" subtitle="No imaging studies match your search." />
      ) : (
        <div className="bg-white rounded-[14px] border border-[var(--bb-border)] shadow-[var(--shadow-sm)] overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[var(--bb-border)] text-[var(--bb-ink-muted)] text-[11px] font-semibold uppercase tracking-wide">
                <th className="text-left px-4 py-3">Accession</th>
                <th className="text-left px-4 py-3">Modality</th>
                <th className="text-left px-4 py-3">Body Part</th>
                <th className="text-left px-4 py-3">Priority</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Acquired</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(study => (
                <tr key={study.id} className="border-t border-[var(--bb-border)] hover:bg-[var(--bb-bg)] transition-colors">
                  <td className="px-4 py-3 font-mono text-[11px] text-[var(--bb-ink-muted)]">
                    {study.accession_no ?? study.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="px-4 py-3 font-medium text-[var(--bb-ink)]">{study.modality_type ?? '—'}</td>
                  <td className="px-4 py-3 text-[var(--bb-ink-muted)]">{study.body_part ?? '—'}</td>
                  <td className="px-4 py-3">
                    <StatusBadge label={study.priority ?? 'routine'} variant={priorityVariant(study.priority ?? '')} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge label={study.status ?? 'scheduled'} variant={statusVariant(study.status ?? '')} />
                  </td>
                  <td className="px-4 py-3 text-[var(--bb-ink-muted)]">
                    {study.acquired_at ? new Date(study.acquired_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/portal/studies/${study.id}`} className="text-[var(--imaging-accent)] hover:underline text-[12px] font-medium">
                      View
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
