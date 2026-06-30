'use client'
import { useState, useEffect } from 'react'
import { Wrench }              from 'lucide-react'
import { PageLoader, EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge, statusVariant } from '@/components/shared/StatusBadge'
import { equipmentApi }        from '@/lib/api'

interface Equipment {
  id:                 string
  name?:              string
  modality_type?:     string
  room_name?:         string
  status?:            string
  lasra_cert_expiry?: string
  next_maintenance?:  string
  serial_number?:     string
  manufacturer?:      string
}

type Tab = 'all' | 'active' | 'offline' | 'maintenance'

const STATUS_DOT: Record<string, string> = {
  active:         'bg-green-500',
  offline:        'bg-red-500',
  maintenance:    'bg-amber-500',
  decommissioned: 'bg-gray-400',
}

export default function EquipmentPage() {
  const [items,   setItems]   = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [tab,     setTab]     = useState<Tab>('all')

  useEffect(() => {
    const params = tab === 'all' ? { limit: 50 } : { limit: 50, status: tab }
    ;(equipmentApi.list(params) as Promise<{ data?: Equipment[] }>)
      .then(d => setItems(d?.data ?? []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [tab])

  const filtered = tab === 'all' ? items : items.filter(e => e.status === tab)

  const isCertExpiring = (expiry?: string) => {
    if (!expiry) return false
    const days = (new Date(expiry).getTime() - Date.now()) / 86400000
    return days < 90
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[var(--bb-ink)]">Equipment</h1>
        <p className="text-[13px] text-[var(--bb-ink-muted)] mt-0.5">Imaging modalities, LASRA certifications, and maintenance tracking.</p>
      </div>

      <div className="flex gap-1 mb-6 bg-white border border-[var(--bb-border)] rounded-[10px] p-1 w-fit">
        {(['all', 'active', 'offline', 'maintenance'] as Tab[]).map(t => (
          <button key={t} onClick={() => { setTab(t); setLoading(true) }}
            className={`px-3 py-1.5 rounded-[8px] text-[12px] font-medium capitalize transition-all ${
              tab === t ? 'bg-[var(--imaging-accent)] text-white' : 'text-[var(--bb-ink-muted)] hover:text-[var(--bb-ink)]'
            }`}>{t}</button>
        ))}
      </div>

      {loading ? <PageLoader label="Loading equipment…" /> : error ? (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Wrench} title="No equipment" subtitle="No imaging equipment found." />
      ) : (
        <div className="bg-white rounded-[14px] border border-[var(--bb-border)] shadow-[var(--shadow-sm)] overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[var(--bb-border)] text-[var(--bb-ink-muted)] text-[11px] font-semibold uppercase tracking-wide">
                <th className="text-left px-4 py-3">Equipment</th>
                <th className="text-left px-4 py-3">Modality</th>
                <th className="text-left px-4 py-3">Room</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">LASRA Cert</th>
                <th className="text-left px-4 py-3">Next Maintenance</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(eq => {
                const certWarning = isCertExpiring(eq.lasra_cert_expiry)
                return (
                  <tr key={eq.id} className="border-t border-[var(--bb-border)] hover:bg-[var(--bb-bg)] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${STATUS_DOT[eq.status ?? ''] ?? 'bg-gray-400'}`} />
                        <div>
                          <p className="font-medium text-[var(--bb-ink)]">{eq.name ?? '—'}</p>
                          {eq.serial_number && <p className="text-[10px] text-[var(--bb-ink-muted)]">{eq.serial_number}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--bb-ink-muted)]">{eq.modality_type ?? '—'}</td>
                    <td className="px-4 py-3 text-[var(--bb-ink-muted)]">{eq.room_name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <StatusBadge label={eq.status ?? 'active'} variant={statusVariant(eq.status ?? '')} />
                    </td>
                    <td className="px-4 py-3">
                      {eq.lasra_cert_expiry ? (
                        <span className={`text-[12px] font-medium ${certWarning ? 'text-[var(--imaging-critical)]' : 'text-[var(--bb-ink-muted)]'}`}>
                          {new Date(eq.lasra_cert_expiry).toLocaleDateString()}
                          {certWarning && <span className="ml-1 text-[10px]">⚠</span>}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-[var(--bb-ink-muted)]">
                      {eq.next_maintenance ? new Date(eq.next_maintenance).toLocaleDateString() : '—'}
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
