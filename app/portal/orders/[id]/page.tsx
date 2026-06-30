'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, ClipboardList } from 'lucide-react'
import { PageLoader }          from '@/components/shared/EmptyState'
import { StatusBadge, statusVariant, priorityVariant } from '@/components/shared/StatusBadge'
import { ordersApi, protocolsApi } from '@/lib/api'

interface Order {
  id:                       string
  ordering_provider_name?:  string
  priority?:                string
  status?:                  string
  received_at?:             string
  modality_type?:           string
  clinical_indication?:     string
  uhr_patient_id?:          string
  notes?:                   string
}

interface Protocol {
  id:   string
  name: string
  modality_type?: string
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [order,   setOrder]   = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [showProtocolModal, setShowProtocolModal] = useState(false)
  const [protocols,  setProtocols]  = useState<Protocol[]>([])
  const [cancelling, setCancelling] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  useEffect(() => {
    ;(ordersApi.get(params.id) as Promise<{ data?: Order }>)
      .then(d => setOrder(d?.data ?? null))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [params.id])

  const openProtocolModal = async () => {
    setShowProtocolModal(true)
    try {
      const d = await protocolsApi.list({ limit: 50 }) as { data?: Protocol[] }
      setProtocols(d?.data ?? [])
    } catch { /* ignore */ }
  }

  const assignProtocol = async (protocolId: string) => {
    try {
      await ordersApi.assignProtocol(params.id, { protocolId })
      setShowProtocolModal(false)
      const d = await ordersApi.get(params.id) as { data?: Order }
      setOrder(d?.data ?? null)
    } catch (e: unknown) {
      setError((e as Error).message)
    }
  }

  const cancelOrder = async () => {
    if (!cancelReason.trim()) return
    setCancelling(true)
    try {
      await ordersApi.cancel(params.id, { reason: cancelReason })
      router.push('/portal/orders')
    } catch (e: unknown) {
      setError((e as Error).message)
    }
    setCancelling(false)
  }

  if (loading) return <PageLoader label="Loading order…" />
  if (error) return (
    <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
  )
  if (!order) return null

  return (
    <div className="max-w-[900px]">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-[13px] text-[var(--bb-ink-muted)] hover:text-[var(--bb-ink)] mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Orders
      </button>

      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-[var(--imaging-accent-bg)] flex items-center justify-center">
            <ClipboardList size={18} className="text-[var(--imaging-accent)]" />
          </div>
          <div>
            <h1 className="text-[18px] font-bold text-[var(--bb-ink)]">
              Order {order.id.slice(0, 8).toUpperCase()}
            </h1>
            <p className="text-[12px] text-[var(--bb-ink-muted)]">Full order ID: {order.id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <StatusBadge label={order.priority ?? 'routine'} variant={priorityVariant(order.priority ?? '')} />
          <StatusBadge label={order.status ?? 'received'} variant={statusVariant(order.status ?? '')} />
        </div>
      </div>

      <div className="bg-white rounded-[14px] border border-[var(--bb-border)] shadow-[var(--shadow-sm)] p-6 mb-4">
        <h2 className="text-[14px] font-bold text-[var(--bb-ink)] mb-4">Order Details</h2>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-[13px]">
          <div>
            <dt className="text-[11px] text-[var(--bb-ink-muted)] uppercase tracking-wide font-medium mb-0.5">Ordering Provider</dt>
            <dd className="font-medium text-[var(--bb-ink)]">{order.ordering_provider_name ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-[var(--bb-ink-muted)] uppercase tracking-wide font-medium mb-0.5">Modality</dt>
            <dd className="font-medium text-[var(--bb-ink)]">{order.modality_type ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-[var(--bb-ink-muted)] uppercase tracking-wide font-medium mb-0.5">Received At</dt>
            <dd className="font-medium text-[var(--bb-ink)]">
              {order.received_at ? new Date(order.received_at).toLocaleString() : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-[var(--bb-ink-muted)] uppercase tracking-wide font-medium mb-0.5">Patient ID</dt>
            <dd className="font-mono text-[11px] text-[var(--bb-ink-muted)]">{order.uhr_patient_id ?? '—'}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-[11px] text-[var(--bb-ink-muted)] uppercase tracking-wide font-medium mb-0.5">Clinical Indication</dt>
            <dd className="text-[var(--bb-ink)]">{order.clinical_indication ?? '—'}</dd>
          </div>
          {order.notes && (
            <div className="col-span-2">
              <dt className="text-[11px] text-[var(--bb-ink-muted)] uppercase tracking-wide font-medium mb-0.5">Notes</dt>
              <dd className="text-[var(--bb-ink)]">{order.notes}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={openProtocolModal}
          className="px-4 py-2 rounded-[8px] bg-[var(--imaging-accent)] text-white text-[13px] font-medium hover:bg-[var(--imaging-accent-hover)] transition-colors"
        >
          Assign Protocol
        </button>
        {order.status !== 'cancelled' && order.status !== 'completed' && (
          <button
            onClick={() => {
              const reason = prompt('Cancellation reason:')
              if (reason) { setCancelReason(reason); }
            }}
            className="px-4 py-2 rounded-[8px] border border-[var(--imaging-danger)] text-[var(--imaging-danger)] text-[13px] font-medium hover:bg-[var(--imaging-danger-bg)] transition-colors"
          >
            Cancel Order
          </button>
        )}
      </div>

      {/* Protocol modal */}
      {showProtocolModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[16px] w-full max-w-[500px] p-6 shadow-[var(--shadow-xl)]">
            <h3 className="text-[16px] font-bold text-[var(--bb-ink)] mb-4">Select Protocol</h3>
            {protocols.length === 0 ? (
              <p className="text-[13px] text-[var(--bb-ink-muted)]">No protocols available.</p>
            ) : (
              <ul className="space-y-2 max-h-[300px] overflow-y-auto">
                {protocols.map(p => (
                  <li key={p.id}>
                    <button
                      onClick={() => assignProtocol(p.id)}
                      className="w-full text-left px-4 py-3 rounded-[10px] border border-[var(--bb-border)] hover:border-[var(--imaging-accent)] hover:bg-[var(--imaging-accent-bg)] transition-all text-[13px]"
                    >
                      <span className="font-medium text-[var(--bb-ink)]">{p.name}</span>
                      {p.modality_type && <span className="ml-2 text-[var(--bb-ink-muted)]">({p.modality_type})</span>}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button
              onClick={() => setShowProtocolModal(false)}
              className="mt-4 w-full py-2 rounded-[8px] border border-[var(--bb-border)] text-[13px] text-[var(--bb-ink-muted)] hover:bg-[var(--bb-bg2)] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Cancel confirmation */}
      {cancelReason && !cancelling && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[16px] w-full max-w-[400px] p-6 shadow-[var(--shadow-xl)]">
            <h3 className="text-[16px] font-bold text-[var(--bb-ink)] mb-2">Confirm Cancellation</h3>
            <p className="text-[13px] text-[var(--bb-ink-muted)] mb-4">Reason: {cancelReason}</p>
            <div className="flex gap-2">
              <button
                onClick={cancelOrder}
                disabled={cancelling}
                className="flex-1 py-2 rounded-[8px] bg-[var(--imaging-danger)] text-white text-[13px] font-medium disabled:opacity-50"
              >
                Confirm Cancel
              </button>
              <button
                onClick={() => setCancelReason('')}
                className="flex-1 py-2 rounded-[8px] border border-[var(--bb-border)] text-[13px] text-[var(--bb-ink-muted)] hover:bg-[var(--bb-bg2)]"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
