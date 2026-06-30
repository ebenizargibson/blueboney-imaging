'use client'
import { useState, useEffect } from 'react'
import { Settings, Plus }      from 'lucide-react'
import { PageLoader }          from '@/components/shared/EmptyState'
import { StatusBadge }         from '@/components/shared/StatusBadge'
import { settingsApi, staffApi } from '@/lib/api'

interface PacsConnection {
  id:              string
  name?:           string
  connection_type?: string
  base_url?:       string
  ae_title?:       string
  is_active?:      boolean
}

interface Protocol {
  id:             string
  name?:          string
  modality_type?: string
  parameters?:    Record<string, unknown>
}

interface Staff {
  id:    string
  name?: string
  role?: string
  email?: string
}

type Tab = 'pacs' | 'protocols' | 'staff'

export default function SettingsPage() {
  const [tab,       setTab]       = useState<Tab>('pacs')
  const [pacs,      setPacs]      = useState<PacsConnection[]>([])
  const [protocols, setProtocols] = useState<Protocol[]>([])
  const [staff,     setStaff]     = useState<Staff[]>([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [showForm,  setShowForm]  = useState(false)

  // PACS form
  const [pacsName,    setPacsName]    = useState('')
  const [pacsType,    setPacsType]    = useState('dicom')
  const [pacsUrl,     setPacsUrl]     = useState('')
  const [pacsAeTitle, setPacsAeTitle] = useState('')
  const [pacsWado,    setPacsWado]    = useState('')
  const [pacsStow,    setPacsStow]    = useState('')
  const [pacsQido,    setPacsQido]    = useState('')
  const [savingPacs,  setSavingPacs]  = useState(false)

  // Protocol form
  const [protoName,     setProtoName]     = useState('')
  const [protoModality, setProtoModality] = useState('')
  const [savingProto,   setSavingProto]   = useState(false)

  // Staff form
  const [staffName,  setStaffName]  = useState('')
  const [staffEmail, setStaffEmail] = useState('')
  const [staffRole,  setStaffRole]  = useState('technologist')
  const [savingStaff, setSavingStaff] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError('')
    if (tab === 'pacs') {
      ;(settingsApi.getPacs() as Promise<{ data?: PacsConnection[] }>)
        .then(d => setPacs(d?.data ?? []))
        .catch(e => setError(e.message))
        .finally(() => setLoading(false))
    } else if (tab === 'protocols') {
      ;(settingsApi.getProtocols() as Promise<{ data?: Protocol[] }>)
        .then(d => setProtocols(d?.data ?? []))
        .catch(e => setError(e.message))
        .finally(() => setLoading(false))
    } else {
      ;(staffApi.list({ limit: 100 }) as Promise<{ data?: Staff[] }>)
        .then(d => setStaff(d?.data ?? []))
        .catch(e => setError(e.message))
        .finally(() => setLoading(false))
    }
  }, [tab])

  const savePacs = async () => {
    setSavingPacs(true)
    try {
      await settingsApi.createPacs({
        name: pacsName, connection_type: pacsType, base_url: pacsUrl,
        ae_title: pacsAeTitle, wado_rs_url: pacsWado, stow_rs_url: pacsStow, qido_rs_url: pacsQido,
      })
      const d = await settingsApi.getPacs() as { data?: PacsConnection[] }
      setPacs(d?.data ?? [])
      setShowForm(false)
      setPacsName(''); setPacsUrl(''); setPacsAeTitle(''); setPacsWado(''); setPacsStow(''); setPacsQido('')
    } catch (e: unknown) { setError((e as Error).message) }
    setSavingPacs(false)
  }

  const saveProtocol = async () => {
    setSavingProto(true)
    try {
      await settingsApi.postProtocol({ name: protoName, modality_type: protoModality })
      const d = await settingsApi.getProtocols() as { data?: Protocol[] }
      setProtocols(d?.data ?? [])
      setShowForm(false)
      setProtoName(''); setProtoModality('')
    } catch (e: unknown) { setError((e as Error).message) }
    setSavingProto(false)
  }

  const saveStaff = async () => {
    setSavingStaff(true)
    try {
      await staffApi.create({ full_name: staffName, email: staffEmail, role: staffRole })
      const d = await staffApi.list({ limit: 100 }) as { data?: Staff[] }
      setStaff(d?.data ?? [])
      setShowForm(false)
      setStaffName(''); setStaffEmail(''); setStaffRole('technologist')
    } catch (e: unknown) { setError((e as Error).message) }
    setSavingStaff(false)
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: 'pacs',      label: 'PACS Connections' },
    { key: 'protocols', label: 'Protocols' },
    { key: 'staff',     label: 'Staff' },
  ]

  const InputField = ({ label, value, onChange, placeholder, type = 'text' }: {
    label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string
  }) => (
    <div className="mb-3">
      <label className="block text-[12px] font-semibold text-[var(--bb-ink)] mb-1.5">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2 rounded-[10px] border border-[var(--bb-border)] text-[13px] text-[var(--bb-ink)] focus:outline-none focus:border-[var(--imaging-accent)] focus:ring-1 focus:ring-[var(--imaging-accent)]/30 transition-all" />
    </div>
  )

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-[10px] bg-[var(--imaging-accent-bg)] flex items-center justify-center">
          <Settings size={18} className="text-[var(--imaging-accent)]" />
        </div>
        <div>
          <h1 className="text-[22px] font-bold text-[var(--bb-ink)]">Settings</h1>
          <p className="text-[13px] text-[var(--bb-ink-muted)]">Configure PACS, protocols, and staff.</p>
        </div>
      </div>

      <div className="flex gap-1 mb-6 bg-white border border-[var(--bb-border)] rounded-[10px] p-1 w-fit">
        {TABS.map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setShowForm(false) }}
            className={`px-3 py-1.5 rounded-[8px] text-[12px] font-medium transition-all ${
              tab === t.key ? 'bg-[var(--imaging-accent)] text-white' : 'text-[var(--bb-ink-muted)] hover:text-[var(--bb-ink)]'
            }`}>{t.label}</button>
        ))}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">{error}</div>
      )}

      {loading ? <PageLoader label="Loading settings…" /> : (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2 rounded-[8px] bg-[var(--imaging-accent)] text-white text-[13px] font-medium hover:bg-[var(--imaging-accent-hover)] transition-colors">
              <Plus size={14} />
              {tab === 'pacs' ? 'Add PACS' : tab === 'protocols' ? 'Add Protocol' : 'Add Staff'}
            </button>
          </div>

          {/* Inline add form */}
          {showForm && (
            <div className="bg-white rounded-[14px] border border-[var(--imaging-accent)] shadow-[var(--shadow)] p-6 mb-4">
              <h3 className="text-[14px] font-bold text-[var(--bb-ink)] mb-4">
                {tab === 'pacs' ? 'New PACS Connection' : tab === 'protocols' ? 'New Protocol' : 'New Staff Member'}
              </h3>

              {tab === 'pacs' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <InputField label="Name" value={pacsName} onChange={setPacsName} placeholder="e.g. Primary PACS" />
                    <div className="mb-3">
                      <label className="block text-[12px] font-semibold text-[var(--bb-ink)] mb-1.5">Connection Type</label>
                      <select value={pacsType} onChange={e => setPacsType(e.target.value)}
                        className="w-full px-3 py-2 rounded-[10px] border border-[var(--bb-border)] text-[13px] text-[var(--bb-ink)] focus:outline-none focus:border-[var(--imaging-accent)] focus:ring-1 focus:ring-[var(--imaging-accent)]/30 transition-all">
                        <option value="dicom">DICOM</option>
                        <option value="dimse">DIMSE</option>
                        <option value="wado">WADO-RS</option>
                        <option value="stow">STOW-RS</option>
                      </select>
                    </div>
                    <InputField label="Base URL" value={pacsUrl} onChange={setPacsUrl} placeholder="https://pacs.example.com" />
                    <InputField label="AE Title" value={pacsAeTitle} onChange={setPacsAeTitle} placeholder="PACS_AE" />
                    <InputField label="WADO-RS URL" value={pacsWado} onChange={setPacsWado} placeholder="/wado" />
                    <InputField label="STOW-RS URL" value={pacsStow} onChange={setPacsStow} placeholder="/stow" />
                    <InputField label="QIDO-RS URL" value={pacsQido} onChange={setPacsQido} placeholder="/qido" />
                  </div>
                  <button onClick={savePacs} disabled={savingPacs || !pacsName}
                    className="mt-2 px-4 py-2 rounded-[8px] bg-[var(--imaging-accent)] text-white text-[13px] font-medium disabled:opacity-50">
                    {savingPacs ? 'Saving…' : 'Save Connection'}
                  </button>
                </>
              )}

              {tab === 'protocols' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <InputField label="Protocol Name" value={protoName} onChange={setProtoName} placeholder="e.g. CT Head w/o Contrast" />
                    <InputField label="Modality" value={protoModality} onChange={setProtoModality} placeholder="CT, MR, XR…" />
                  </div>
                  <button onClick={saveProtocol} disabled={savingProto || !protoName}
                    className="mt-2 px-4 py-2 rounded-[8px] bg-[var(--imaging-accent)] text-white text-[13px] font-medium disabled:opacity-50">
                    {savingProto ? 'Saving…' : 'Save Protocol'}
                  </button>
                </>
              )}

              {tab === 'staff' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <InputField label="Full Name" value={staffName} onChange={setStaffName} placeholder="Dr. Jane Doe" />
                    <InputField label="Email" value={staffEmail} onChange={setStaffEmail} placeholder="jane@hospital.com" type="email" />
                    <div className="mb-3">
                      <label className="block text-[12px] font-semibold text-[var(--bb-ink)] mb-1.5">Role</label>
                      <select value={staffRole} onChange={e => setStaffRole(e.target.value)}
                        className="w-full px-3 py-2 rounded-[10px] border border-[var(--bb-border)] text-[13px] text-[var(--bb-ink)] focus:outline-none focus:border-[var(--imaging-accent)] focus:ring-1 focus:ring-[var(--imaging-accent)]/30 transition-all">
                        <option value="radiologist">Radiologist</option>
                        <option value="technologist">Technologist</option>
                        <option value="technician">Technician</option>
                        <option value="sonographer">Sonographer</option>
                        <option value="nuclear_medicine">Nuclear Medicine</option>
                        <option value="scheduling_coordinator">Scheduling Coordinator</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>
                  </div>
                  <button onClick={saveStaff} disabled={savingStaff || !staffName || !staffEmail}
                    className="mt-2 px-4 py-2 rounded-[8px] bg-[var(--imaging-accent)] text-white text-[13px] font-medium disabled:opacity-50">
                    {savingStaff ? 'Saving…' : 'Create Staff'}
                  </button>
                </>
              )}
            </div>
          )}

          {/* PACS list */}
          {tab === 'pacs' && (
            pacs.length === 0 ? (
              <p className="text-[13px] text-[var(--bb-ink-muted)]">No PACS connections configured.</p>
            ) : (
              <div className="bg-white rounded-[14px] border border-[var(--bb-border)] shadow-[var(--shadow-sm)] overflow-hidden">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-[var(--bb-border)] text-[var(--bb-ink-muted)] text-[11px] font-semibold uppercase tracking-wide">
                      <th className="text-left px-4 py-3">Name</th>
                      <th className="text-left px-4 py-3">Type</th>
                      <th className="text-left px-4 py-3">AE Title</th>
                      <th className="text-left px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pacs.map(p => (
                      <tr key={p.id} className="border-t border-[var(--bb-border)] hover:bg-[var(--bb-bg)]">
                        <td className="px-4 py-3 font-medium text-[var(--bb-ink)]">{p.name ?? '—'}</td>
                        <td className="px-4 py-3 text-[var(--bb-ink-muted)] uppercase text-[11px]">{p.connection_type ?? '—'}</td>
                        <td className="px-4 py-3 font-mono text-[11px] text-[var(--bb-ink-muted)]">{p.ae_title ?? '—'}</td>
                        <td className="px-4 py-3">
                          <StatusBadge label={p.is_active ? 'active' : 'inactive'} variant={p.is_active ? 'success' : 'neutral'} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {/* Protocols list */}
          {tab === 'protocols' && (
            protocols.length === 0 ? (
              <p className="text-[13px] text-[var(--bb-ink-muted)]">No protocols configured.</p>
            ) : (
              <div className="bg-white rounded-[14px] border border-[var(--bb-border)] shadow-[var(--shadow-sm)] overflow-hidden">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-[var(--bb-border)] text-[var(--bb-ink-muted)] text-[11px] font-semibold uppercase tracking-wide">
                      <th className="text-left px-4 py-3">Name</th>
                      <th className="text-left px-4 py-3">Modality</th>
                    </tr>
                  </thead>
                  <tbody>
                    {protocols.map(p => (
                      <tr key={p.id} className="border-t border-[var(--bb-border)] hover:bg-[var(--bb-bg)]">
                        <td className="px-4 py-3 font-medium text-[var(--bb-ink)]">{p.name ?? '—'}</td>
                        <td className="px-4 py-3 text-[var(--bb-ink-muted)]">{p.modality_type ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {/* Staff list */}
          {tab === 'staff' && (
            staff.length === 0 ? (
              <p className="text-[13px] text-[var(--bb-ink-muted)]">No staff members found.</p>
            ) : (
              <div className="bg-white rounded-[14px] border border-[var(--bb-border)] shadow-[var(--shadow-sm)] overflow-hidden">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-[var(--bb-border)] text-[var(--bb-ink-muted)] text-[11px] font-semibold uppercase tracking-wide">
                      <th className="text-left px-4 py-3">Name</th>
                      <th className="text-left px-4 py-3">Email</th>
                      <th className="text-left px-4 py-3">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staff.map(s => (
                      <tr key={s.id} className="border-t border-[var(--bb-border)] hover:bg-[var(--bb-bg)]">
                        <td className="px-4 py-3 font-medium text-[var(--bb-ink)]">{s.name ?? '—'}</td>
                        <td className="px-4 py-3 text-[var(--bb-ink-muted)]">{s.email ?? '—'}</td>
                        <td className="px-4 py-3">
                          <StatusBadge label={s.role ?? 'staff'} variant="accent" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}
