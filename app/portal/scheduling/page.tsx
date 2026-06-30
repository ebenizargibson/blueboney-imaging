'use client'
import { useState, useEffect } from 'react'
import Link                    from 'next/link'
import { CalendarDays }        from 'lucide-react'
import { PageLoader, EmptyState } from '@/components/shared/EmptyState'
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
}

function groupByDate(apts: Appointment[]): Record<string, Appointment[]> {
  const groups: Record<string, Appointment[]> = {}
  const sorted = [...apts].sort((a, b) =>
    (a.scheduled_at ?? '').localeCompare(b.scheduled_at ?? '')
  )
  for (const apt of sorted) {
    const key = apt.scheduled_at
      ? new Date(apt.scheduled_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      : 'Unscheduled'
    if (!groups[key]) groups[key] = []
    groups[key].push(apt)
  }
  return groups
}

export default function SchedulingPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')

  useEffect(() => {
    ;(appointmentsApi.list({ limit: 100 }) as Promise<{ data?: Appointment[] }>)
      .then(d => setAppointments(d?.data ?? []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const grouped = groupByDate(appointments)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[var(--bb-ink)]">Scheduling</h1>
        <p className="text-[13px] text-[var(--bb-ink-muted)] mt-0.5">Manage appointments and imaging slots.</p>
      </div>

      {loading ? <PageLoader label="Loading appointments…" /> : error ? (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : appointments.length === 0 ? (
        <EmptyState icon={CalendarDays} title="No appointments" subtitle="No appointments scheduled." />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, apts]) => (
            <div key={date}>
              <h2 className="text-[13px] font-bold text-[var(--bb-ink-muted)] uppercase tracking-wide mb-3">{date}</h2>
              <div className="bg-white rounded-[14px] border border-[var(--bb-border)] shadow-[var(--shadow-sm)] overflow-hidden">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-[var(--bb-border)] text-[var(--bb-ink-muted)] text-[11px] font-semibold uppercase tracking-wide">
                      <th className="text-left px-4 py-3">Time</th>
                      <th className="text-left px-4 py-3">Patient</th>
                      <th className="text-left px-4 py-3">Type</th>
                      <th className="text-left px-4 py-3">Equipment</th>
                      <th className="text-left px-4 py-3">Priority</th>
                      <th className="text-left px-4 py-3">Status</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {apts.map(apt => (
                      <tr key={apt.id} className="border-t border-[var(--bb-border)] hover:bg-[var(--bb-bg)] transition-colors">
                        <td className="px-4 py-3 font-medium text-[var(--bb-ink)]">
                          {apt.scheduled_at
                            ? new Date(apt.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : '—'}
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-[var(--bb-ink-muted)]">
                          {apt.uhr_patient_id ? apt.uhr_patient_id.slice(0, 8) : apt.notes?.slice(0, 20) ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-[var(--bb-ink-muted)] capitalize">{apt.appointment_type ?? '—'}</td>
                        <td className="px-4 py-3 text-[var(--bb-ink-muted)]">{apt.equipment_name ?? '—'}</td>
                        <td className="px-4 py-3">
                          <StatusBadge label={apt.priority ?? 'routine'} variant={priorityVariant(apt.priority ?? '')} />
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge label={apt.status ?? 'scheduled'} variant={statusVariant(apt.status ?? '')} />
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/portal/scheduling/appointments/${apt.id}`}
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
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
