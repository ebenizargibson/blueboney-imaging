'use client'
import { useState, useEffect } from 'react'
import { Package }             from 'lucide-react'
import { PageLoader, EmptyState } from '@/components/shared/EmptyState'
import { inventoryApi }        from '@/lib/api'

interface InventoryItem {
  id:                string
  name?:             string
  item_type?:        string
  quantity_on_hand?: number
  reorder_point?:    number
  unit?:             string
}

function groupByType(items: InventoryItem[]): Record<string, InventoryItem[]> {
  const g: Record<string, InventoryItem[]> = {}
  for (const item of items) {
    const k = item.item_type ?? 'other'
    if (!g[k]) g[k] = []
    g[k].push(item)
  }
  return g
}

export default function InventoryPage() {
  const [items,   setItems]   = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [receiveId,   setReceiveId]   = useState<string | null>(null)
  const [receiveLot,  setReceiveLot]  = useState('')
  const [receiveQty,  setReceiveQty]  = useState('')
  const [receiving,   setReceiving]   = useState(false)

  const load = () => {
    ;(inventoryApi.list({ limit: 100 }) as Promise<{ data?: InventoryItem[] }>)
      .then(d => setItems(d?.data ?? []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const submitReceive = async () => {
    if (!receiveId || !receiveQty) return
    setReceiving(true)
    try {
      await inventoryApi.receiveLot(receiveId, { lot_number: receiveLot, quantity: parseInt(receiveQty) })
      setReceiveId(null)
      setReceiveLot('')
      setReceiveQty('')
      load()
    } catch (e: unknown) { setError((e as Error).message) }
    setReceiving(false)
  }

  const grouped = groupByType(items)
  const isLow = (item: InventoryItem) =>
    item.reorder_point != null && (item.quantity_on_hand ?? 0) <= item.reorder_point

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[var(--bb-ink)]">Inventory</h1>
        <p className="text-[13px] text-[var(--bb-ink-muted)] mt-0.5">Contrast agents, radiopharmaceuticals, and supplies.</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">{error}</div>
      )}

      {loading ? <PageLoader label="Loading inventory…" /> : items.length === 0 ? (
        <EmptyState icon={Package} title="No inventory items" subtitle="No inventory records found." />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([type, typeItems]) => (
            <div key={type}>
              <h2 className="text-[12px] font-bold text-[var(--bb-ink-muted)] uppercase tracking-wide mb-3 capitalize">
                {type.replace(/_/g, ' ')}
              </h2>
              <div className="bg-white rounded-[14px] border border-[var(--bb-border)] shadow-[var(--shadow-sm)] overflow-hidden">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-[var(--bb-border)] text-[var(--bb-ink-muted)] text-[11px] font-semibold uppercase tracking-wide">
                      <th className="text-left px-4 py-3">Item</th>
                      <th className="text-left px-4 py-3">On Hand</th>
                      <th className="text-left px-4 py-3">Reorder Point</th>
                      <th className="text-left px-4 py-3">Unit</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {typeItems.map(item => {
                      const low = isLow(item)
                      return (
                        <tr key={item.id} className={`border-t border-[var(--bb-border)] transition-colors ${low ? 'bg-amber-50' : 'hover:bg-[var(--bb-bg)]'}`}>
                          <td className="px-4 py-3 font-medium text-[var(--bb-ink)]">{item.name ?? '—'}</td>
                          <td className="px-4 py-3">
                            <span className={`font-bold text-[14px] ${low ? 'text-[var(--imaging-critical)]' : 'text-[var(--bb-ink)]'}`}>
                              {item.quantity_on_hand ?? 0}
                            </span>
                            {low && <span className="ml-2 text-[10px] font-semibold text-[var(--imaging-stat)] uppercase">Low</span>}
                          </td>
                          <td className="px-4 py-3 text-[var(--bb-ink-muted)]">{item.reorder_point ?? '—'}</td>
                          <td className="px-4 py-3 text-[var(--bb-ink-muted)]">{item.unit ?? '—'}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => setReceiveId(item.id)}
                              className="text-[var(--imaging-accent)] hover:underline text-[11px] font-medium"
                            >
                              Receive Lot
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Receive lot modal */}
      {receiveId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[16px] w-full max-w-[400px] p-6 shadow-[var(--shadow-xl)]">
            <h3 className="text-[16px] font-bold text-[var(--bb-ink)] mb-4">Receive Lot</h3>
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-[12px] font-semibold text-[var(--bb-ink)] mb-1.5">Lot Number</label>
                <input type="text" value={receiveLot} onChange={e => setReceiveLot(e.target.value)} placeholder="LOT-XXXX"
                  className="w-full px-3 py-2 rounded-[10px] border border-[var(--bb-border)] text-[13px] text-[var(--bb-ink)] focus:outline-none focus:border-[var(--imaging-accent)] focus:ring-1 focus:ring-[var(--imaging-accent)]/30 transition-all" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[var(--bb-ink)] mb-1.5">Quantity</label>
                <input type="number" value={receiveQty} onChange={e => setReceiveQty(e.target.value)} placeholder="0"
                  className="w-full px-3 py-2 rounded-[10px] border border-[var(--bb-border)] text-[13px] text-[var(--bb-ink)] focus:outline-none focus:border-[var(--imaging-accent)] focus:ring-1 focus:ring-[var(--imaging-accent)]/30 transition-all" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={submitReceive} disabled={receiving || !receiveQty}
                className="flex-1 py-2 rounded-[8px] bg-[var(--imaging-accent)] text-white text-[13px] font-medium disabled:opacity-50">
                {receiving ? 'Receiving…' : 'Receive'}
              </button>
              <button onClick={() => { setReceiveId(null); setReceiveLot(''); setReceiveQty('') }}
                className="flex-1 py-2 rounded-[8px] border border-[var(--bb-border)] text-[13px] text-[var(--bb-ink-muted)] hover:bg-[var(--bb-bg2)]">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
