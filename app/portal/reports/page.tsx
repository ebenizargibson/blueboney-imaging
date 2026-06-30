'use client'
import { useState, useEffect } from 'react'
import { BarChart3 }           from 'lucide-react'
import { PageLoader }          from '@/components/shared/EmptyState'
import { reportsApi }          from '@/lib/api'

interface OperationalReport {
  turnaround?: {
    average_minutes?: number
    stat_minutes?:    number
    urgent_minutes?:  number
    routine_minutes?: number
  }
  volume_by_modality?: Array<{
    modality: string
    count:    number
  }>
  dose_compliance?: {
    total?:      number
    compliant?:  number
    percentage?: number
  }
}

export default function ReportsPage() {
  const [report,  setReport]  = useState<OperationalReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    ;((reportsApi as unknown as { list: (p: Record<string, unknown>) => Promise<unknown> }).list({ type: 'operational' }) as Promise<{ data?: OperationalReport }>)
      .then(d => setReport(d?.data ?? null))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader label="Loading operational reports…" />

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[var(--bb-ink)]">Operational Reports</h1>
        <p className="text-[13px] text-[var(--bb-ink-muted)] mt-0.5">TAT, volume, and dose compliance analytics.</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">{error}</div>
      )}

      {!report ? (
        <div className="bg-white rounded-[14px] border border-[var(--bb-border)] shadow-[var(--shadow-sm)] p-12 flex flex-col items-center justify-center">
          <BarChart3 size={36} className="text-[var(--imaging-accent)] mb-3" />
          <p className="text-[15px] font-semibold text-[var(--bb-ink)]">No report data available</p>
          <p className="text-[13px] text-[var(--bb-ink-muted)] mt-1">Operational reports will appear here once data is available.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* TAT */}
          {report.turnaround && (
            <div className="bg-white rounded-[14px] border border-[var(--bb-border)] shadow-[var(--shadow-sm)] p-6">
              <h2 className="text-[14px] font-bold text-[var(--bb-ink)] mb-4">Turnaround Time</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Average', value: report.turnaround.average_minutes },
                  { label: 'STAT',    value: report.turnaround.stat_minutes },
                  { label: 'Urgent',  value: report.turnaround.urgent_minutes },
                  { label: 'Routine', value: report.turnaround.routine_minutes },
                ].map(item => (
                  <div key={item.label} className="p-4 rounded-[10px] bg-[var(--bb-bg)]">
                    <p className="text-[11px] text-[var(--bb-ink-muted)] font-medium mb-1">{item.label}</p>
                    <p className="text-[24px] font-bold text-[var(--imaging-accent)]">
                      {item.value ?? '—'}
                    </p>
                    {item.value != null && <p className="text-[10px] text-[var(--bb-ink-muted)]">minutes</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Volume by modality */}
          {report.volume_by_modality && report.volume_by_modality.length > 0 && (
            <div className="bg-white rounded-[14px] border border-[var(--bb-border)] shadow-[var(--shadow-sm)] p-6">
              <h2 className="text-[14px] font-bold text-[var(--bb-ink)] mb-4">Volume by Modality</h2>
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-[var(--bb-border)] text-[var(--bb-ink-muted)] text-[11px] font-semibold uppercase tracking-wide">
                    <th className="text-left pb-2">Modality</th>
                    <th className="text-right pb-2">Studies</th>
                    <th className="pb-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {report.volume_by_modality.map(row => {
                    const maxCount = Math.max(...report.volume_by_modality!.map(r => r.count))
                    const pct = maxCount > 0 ? (row.count / maxCount) * 100 : 0
                    return (
                      <tr key={row.modality} className="border-t border-[var(--bb-border)]">
                        <td className="py-3 font-medium text-[var(--bb-ink)]">{row.modality}</td>
                        <td className="py-3 text-right font-bold text-[var(--imaging-accent)]">{row.count}</td>
                        <td className="py-3 pl-4 w-[40%]">
                          <div className="h-2 bg-[var(--bb-bg2)] rounded-full overflow-hidden">
                            <div className="h-full bg-[var(--imaging-accent)] rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Dose compliance */}
          {report.dose_compliance && (
            <div className="bg-white rounded-[14px] border border-[var(--bb-border)] shadow-[var(--shadow-sm)] p-6">
              <h2 className="text-[14px] font-bold text-[var(--bb-ink)] mb-4">Dose Compliance (DRL)</h2>
              <div className="flex items-end gap-4">
                <div>
                  <p className={`text-[48px] font-bold ${(report.dose_compliance.percentage ?? 0) >= 90 ? 'text-[var(--imaging-success)]' : 'text-[var(--imaging-warning)]'}`}>
                    {report.dose_compliance.percentage ?? 0}%
                  </p>
                  <p className="text-[13px] text-[var(--bb-ink-muted)]">
                    {report.dose_compliance.compliant ?? 0} of {report.dose_compliance.total ?? 0} studies within DRL
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
