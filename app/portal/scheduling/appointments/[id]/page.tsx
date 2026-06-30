'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft }           from 'lucide-react'
import { PageLoader }          from '@/components/shared/EmptyState'
import { StatusBadge, statusVariant, priorityVariant } from '@/components/shared/StatusBadge'
import { appointmentsApi }     from '@/lib/api'

interface Appointment {
  id:              string
  appointment_type?: string
  scheduled_at?:   string
  status?:         string
  priority?:       string
  equipment_name?: string
  uhr_patient_id?: string
  notes?:          string
  duration_minutes?: number
}

type ActiveTab = 'overview' | 'prep' | 'contrast' | 'consent'

export default function AppointmentDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [apt,     setApt]     = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [tab,     setTab]     = useState<ActiveTab>('overview')
  const [tabData, setTabData] = useState<Record<string, unknown> | null>(null)
  const [tabLoading, setTabLoading] = useState(false)
  const [checkinLoading, setCheckinLoading] = useState(false)

  useEffect(() => {
    ;(appointmentsApi.get(params.id) as Promise<{ data?: Appointment }>)
      .then(d => setApt(d?.data ?? null))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [params.id])

  useEffect(() => {
    if (tab === 'overview' || !apt) return
    setTabLoading(true)
    const fetcher = tab === 'prep'
      ? appointmentsApi.getPrep(params.id)
      : tab === 'contrast'
        ? appointmentsApi.getContrastScreening(params.id)
        : Promise.resolve(null)
    ;(fetcher as Promise<Record<string, unknown> | null>)
      .then(d => setTabData(d))
      .catch(() => setTabData(null))
      .finally(() => setTabLoading(false))
  }, [tab, apt, params.id])

  const checkin = async () => {
    setCheckinLoading(true)
    try {
      await appointmentsApi.checkin(params.id)
      const d = await appointmentsApi.get(params.id) as { data?: Appointment }
      setApt(d?.data ?? null)
    } catch (e: unknown) {
      setError((e as Error).message)
    }
    setCheckinLoading(false)
  }

  if (loading) return <PageLoader label="Loading appointment…" />
  if (error) return (
    <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
  )
  if (!apt) return null

  const TABS: { key: ActiveTab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'prep',     label: 'Patient Prep' },
    { key: 'contrast', label: 'Contrast Screening' },
    { key: 'consent',  label: 'Consent' },
  ]

  return (
    <div className="max-w-[900px]">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-[13px] text-[var(--bb-ink-muted)] hover:text-[var(--bb-ink)] mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Scheduling
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[18px] font-bold text-[var(--bb-ink)]">Appointment {apt.id.slice(0, 8).toUpperCase()}</h1>
          <p className="text-[12px] text-[var(--bb-ink-muted)] mt-0.5">
            {apt.scheduled_at ? new Date(apt.scheduled_at).toLocaleString() : 'No time set'}
          </p>
        </div>
        <div className="flex gap-2">
          <StatusBadge label={apt.priority ?? 'routine'} variant={priorityVariant(apt.priority ?? '')} />
          <StatusBadge label={apt.status ?? 'scheduled'} variant={statusVariant(apt.status ?? '')} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white border border-[var(--bb-border)] rounded-[10px] p-1 w-fit">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 rounded-[8px] text-[12px] font-medium transition-all ${
              tab === t.key ? 'bg-[var(--imaging-accent)] text-white' : 'text-[var(--bb-ink-muted)] hover:text-[var(--bb-ink)]'
            }`}>{t.label}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="bg-white rounded-[14px] border border-[var(--bb-border)] shadow-[var(--shadow-sm)] p-6">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-[13px]">
            <div>
              <dt className="text-[11px] text-[var(--bb-ink-muted)] uppercase tracking-wide font-medium mb-0.5">Type</dt>
              <dd className="font-medium text-[var(--bb-ink)] capitalize">{apt.appointment_type ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-[var(--bb-ink-muted)] uppercase tracking-wide font-medium mb-0.5">Equipment</dt>
              <dd className="font-medium text-[var(--bb-ink)]">{apt.equipment_name ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-[var(--bb-ink-muted)] uppercase tracking-wide font-medium mb-0.5">Patient</dt>
              <dd className="font-mono text-[11px] text-[var(--bb-ink-muted)]">{apt.uhr_patient_id ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-[var(--bb-ink-muted)] uppercase tracking-wide font-medium mb-0.5">Duration</dt>
              <dd className="font-medium text-[var(--bb-ink)]">{apt.duration_minutes ? `${apt.duration_minutes} min` : '—'}</dd>
            </div>
            {apt.notes && (
              <div className="col-span-2">
                <dt className="text-[11px] text-[var(--bb-ink-muted)] uppercase tracking-wide font-medium mb-0.5">Notes</dt>
                <dd className="text-[var(--bb-ink)]">{apt.notes}</dd>
              </div>
            )}
          </dl>

          {apt.status === 'scheduled' && (
            <div className="mt-6 pt-5 border-t border-[var(--bb-border)]">
              <button
                onClick={checkin}
                disabled={checkinLoading}
                className="px-4 py-2 rounded-[8px] bg-[var(--imaging-success)] text-white text-[13px] font-medium disabled:opacity-50"
              >
                {checkinLoading ? 'Checking in…' : 'Check In Patient'}
              </button>
            </div>
          )}
        </div>
      )}

      {tab !== 'overview' && (
        <div className="bg-white rounded-[14px] border border-[var(--bb-border)] shadow-[var(--shadow-sm)] p-6">
          {tabLoading ? (
            <PageLoader label={`Loading ${tab}…`} />
          ) : tabData ? (
            <pre className="text-[12px] text-[var(--bb-ink-muted)] whitespace-pre-wrap">
              {JSON.stringify(tabData, null, 2)}
            </pre>
          ) : (
            <p className="text-[13px] text-[var(--bb-ink-muted)]">No {tab} data available.</p>
          )}
        </div>
      )}
    </div>
  )
}
