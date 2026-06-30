'use client'
import { useState, useEffect } from 'react'
import Link                    from 'next/link'
import { ClipboardList }       from 'lucide-react'
import { PageLoader, EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge, statusVariant, priorityVariant } from '@/components/shared/StatusBadge'
import { ordersApi }           from '@/lib/api'

interface Order {
  id:                     string
  ordering_provider_name?: string
  priority?:              string
  status?:                string
  received_at?:           string
  modality_type?:         string
}

const TABS = ['all', 'received', 'scheduled', 'in_progress', 'completed', 'cancelled'] as const
type Tab = typeof TABS[number]

export default function OrdersPage() {
  const [orders,  setOrders]  = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [tab,     setTab]     = useState<Tab>('all')

  useEffect(() => {
    const params = tab === 'all' ? { limit: 50 } : { limit: 50, status: tab }
    ;(ordersApi.list(params) as Promise<{ data?: Order[] }>)
      .then(d => setOrders(d?.data ?? []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [tab])

  const filtered = tab === 'all' ? orders : orders.filter(o => o.status === tab)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[var(--bb-ink)]">Imaging Orders</h1>
        <p className="text-[13px] text-[var(--bb-ink-muted)] mt-0.5">Manage and track all imaging orders.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white border border-[var(--bb-border)] rounded-[10px] p-1 w-fit">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setLoading(true) }}
            className={`px-3 py-1.5 rounded-[8px] text-[12px] font-medium capitalize transition-all ${
              tab === t
                ? 'bg-[var(--imaging-accent)] text-white'
                : 'text-[var(--bb-ink-muted)] hover:text-[var(--bb-ink)]'
            }`}
          >
            {t.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {loading ? <PageLoader label="Loading orders…" /> : error ? (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No orders" subtitle="No imaging orders found for this filter." />
      ) : (
        <div className="bg-white rounded-[14px] border border-[var(--bb-border)] shadow-[var(--shadow-sm)] overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[var(--bb-border)] text-[var(--bb-ink-muted)] text-[11px] font-semibold uppercase tracking-wide">
                <th className="text-left px-4 py-3">Order ID</th>
                <th className="text-left px-4 py-3">Provider</th>
                <th className="text-left px-4 py-3">Modality</th>
                <th className="text-left px-4 py-3">Priority</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Received</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => (
                <tr key={order.id} className="border-t border-[var(--bb-border)] hover:bg-[var(--bb-bg)] transition-colors">
                  <td className="px-4 py-3 font-mono text-[11px] text-[var(--bb-ink-muted)]">
                    {order.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="px-4 py-3 font-medium text-[var(--bb-ink)]">
                    {order.ordering_provider_name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-[var(--bb-ink-muted)]">{order.modality_type ?? '—'}</td>
                  <td className="px-4 py-3">
                    <StatusBadge label={order.priority ?? 'routine'} variant={priorityVariant(order.priority ?? '')} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge label={order.status ?? 'received'} variant={statusVariant(order.status ?? '')} />
                  </td>
                  <td className="px-4 py-3 text-[var(--bb-ink-muted)]">
                    {order.received_at ? new Date(order.received_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/portal/orders/${order.id}`}
                      className="text-[var(--imaging-accent)] hover:underline text-[12px] font-medium"
                    >
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
