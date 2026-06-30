'use client'
import { useState, useEffect } from 'react'
import {
  CalendarDays, Activity, Clock, AlertTriangle,
  Zap, Timer, WifiOff, Package,
} from 'lucide-react'
import { KPICard }    from '@/components/shared/KPICard'
import { PageLoader } from '@/components/shared/EmptyState'
import { StatusBadge, statusVariant } from '@/components/shared/StatusBadge'
import { dashboardApi } from '@/lib/api'

interface DashData {
  data?: {
    todayAppointments?:           number
    studiesInProgress?:           number
    studiesAwaitingInterpretation?: number
    criticalFindingsPending?:     number
    statToday?:                   number
    urgentToday?:                 number
    equipmentOffline?:            number
    inventoryBelowReorder?:       number
    averageTatMinutes?:           number
    appointmentsByStatus?:        Record<string, number>
    credentialsExpiringSoon?:     Array<{
      staffId:   string
      name:      string
      role:      string
      expiryDate: string
    }>
  }
}

const APT_STATUSES = ['scheduled', 'checked_in', 'in_prep', 'in_progress', 'completed', 'no_show']

export default function DashboardPage() {
  const [data,    setData]    = useState<DashData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    ;(dashboardApi.getKPIs() as Promise<DashData>)
      .then(d => setData(d))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader label="Loading dashboard…" />

  if (error) return (
    <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
      Failed to load dashboard: {error}
    </div>
  )

  const d = data?.data

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[var(--bb-ink)]">Imaging Dashboard</h1>
        <p className="text-[13px] text-[var(--bb-ink-muted)] mt-0.5">
          Overview of today&apos;s imaging activity, studies, and critical findings.
        </p>
      </div>

      {/* Row 1 KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <KPICard
          title="Today's Appointments"
          value={d?.todayAppointments ?? 0}
          icon={CalendarDays}
          variant="default"
          subtitle="Total scheduled today"
        />
        <KPICard
          title="Studies In Progress"
          value={d?.studiesInProgress ?? 0}
          icon={Activity}
          variant={d?.studiesInProgress ? 'warning' : 'default'}
          subtitle="Currently being acquired"
        />
        <KPICard
          title="Awaiting Interpretation"
          value={d?.studiesAwaitingInterpretation ?? 0}
          icon={Clock}
          variant={d?.studiesAwaitingInterpretation ? 'stat' : 'default'}
          subtitle="Pending radiologist read"
        />
        <KPICard
          title="Critical Findings"
          value={d?.criticalFindingsPending ?? 0}
          icon={AlertTriangle}
          variant={d?.criticalFindingsPending ? 'critical' : 'success'}
          subtitle="Pending notification"
          badge={d?.criticalFindingsPending ? 'ACT NOW' : undefined}
        />
      </div>

      {/* Row 2 KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard
          title="STAT Today"
          value={d?.statToday ?? 0}
          icon={Zap}
          variant={d?.statToday ? 'critical' : 'default'}
          subtitle="Stat priority orders"
        />
        <KPICard
          title="Urgent Today"
          value={d?.urgentToday ?? 0}
          icon={Timer}
          variant={d?.urgentToday ? 'stat' : 'default'}
          subtitle="Urgent priority orders"
        />
        <KPICard
          title="Equipment Offline"
          value={d?.equipmentOffline ?? 0}
          icon={WifiOff}
          variant={d?.equipmentOffline ? 'danger' : 'success'}
          subtitle="Modalities unavailable"
          badge={d?.equipmentOffline ? 'OPS' : undefined}
        />
        <KPICard
          title="Below Reorder"
          value={d?.inventoryBelowReorder ?? 0}
          icon={Package}
          variant={d?.inventoryBelowReorder ? 'warning' : 'default'}
          subtitle="Inventory items low"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Average TAT */}
        <div className="bg-white rounded-[14px] border border-[var(--bb-border)] shadow-[var(--shadow-sm)] p-5">
          <h2 className="text-[14px] font-bold text-[var(--bb-ink)] mb-1">Average TAT (7 days)</h2>
          <p className="text-[12px] text-[var(--bb-ink-muted)] mb-4">Turnaround time order → signed report</p>
          {d?.averageTatMinutes != null ? (
            <div>
              <span className="text-[36px] font-bold text-[var(--imaging-accent)]">{d.averageTatMinutes}</span>
              <span className="text-[14px] text-[var(--bb-ink-muted)] ml-1">min</span>
            </div>
          ) : (
            <p className="text-[13px] text-[var(--bb-ink-muted)]">No data available</p>
          )}
        </div>

        {/* Appointments by status */}
        <div className="bg-white rounded-[14px] border border-[var(--bb-border)] shadow-[var(--shadow-sm)] p-5">
          <h2 className="text-[14px] font-bold text-[var(--bb-ink)] mb-4">Appointments by Status</h2>
          {d?.appointmentsByStatus ? (
            <table className="w-full text-[12px]">
              <thead>
                <tr className="text-[var(--bb-ink-muted)]">
                  <th className="text-left pb-2 font-medium">Status</th>
                  <th className="text-right pb-2 font-medium">Count</th>
                </tr>
              </thead>
              <tbody>
                {APT_STATUSES.map(s => (
                  <tr key={s} className="border-t border-[var(--bb-border)]">
                    <td className="py-2">
                      <StatusBadge label={s.replace(/_/g, ' ')} variant={statusVariant(s)} />
                    </td>
                    <td className="py-2 text-right font-semibold text-[var(--bb-ink)]">
                      {d.appointmentsByStatus?.[s] ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-[13px] text-[var(--bb-ink-muted)]">No data</p>
          )}
        </div>

        {/* Credentials expiring */}
        <div className="bg-white rounded-[14px] border border-[var(--bb-border)] shadow-[var(--shadow-sm)] p-5">
          <h2 className="text-[14px] font-bold text-[var(--bb-ink)] mb-1">Credentials Expiring</h2>
          <p className="text-[12px] text-[var(--bb-ink-muted)] mb-4">Within 60 days</p>
          {d?.credentialsExpiringSoon?.length ? (
            <table className="w-full text-[12px]">
              <thead>
                <tr className="text-[var(--bb-ink-muted)]">
                  <th className="text-left pb-2 font-medium">Name</th>
                  <th className="text-left pb-2 font-medium">Role</th>
                  <th className="text-right pb-2 font-medium">Expires</th>
                </tr>
              </thead>
              <tbody>
                {d.credentialsExpiringSoon.map(c => (
                  <tr key={c.staffId} className="border-t border-[var(--bb-border)]">
                    <td className="py-2 font-medium text-[var(--bb-ink)]">{c.name}</td>
                    <td className="py-2 text-[var(--bb-ink-muted)]">{c.role}</td>
                    <td className="py-2 text-right text-[var(--imaging-stat)] font-semibold">
                      {new Date(c.expiryDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-[13px] text-[var(--bb-ink-muted)]">No credentials expiring soon</p>
          )}
        </div>
      </div>
    </div>
  )
}
