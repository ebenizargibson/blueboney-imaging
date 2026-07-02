'use client'
import { useState, useEffect } from 'react'
import { ImagingSidebar }      from '@/components/layout/ImagingSidebar'
import { ImagingHeader }       from '@/components/layout/ImagingHeader'
import { PageLoader }          from '@/components/shared/EmptyState'
import { authApi, dashboardApi } from '@/lib/api'

interface StaffMe {
  fullName?:   string
  email?:      string
  role?:       string
  locationId?: string
}

interface DashboardData {
  data?: {
    criticalFindingsPending?: number
    equipmentOffline?:        number
  }
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const [staff,   setStaff]   = useState<StaffMe | null>(null)
  const [loading, setLoading] = useState(true)
  const [criticalPending,  setCriticalPending]  = useState(0)
  const [equipmentOffline, setEquipmentOffline] = useState(0)

  useEffect(() => {
    ;(authApi.me() as Promise<{ data?: StaffMe }>)
      .then(d => setStaff(d?.data ?? {}))
      .catch(() => setStaff({}))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!staff) return
    const loadBadges = () => {
      ;(dashboardApi.getKPIs() as Promise<DashboardData>).then(d => {
        setCriticalPending(d?.data?.criticalFindingsPending ?? 0)
        setEquipmentOffline(d?.data?.equipmentOffline ?? 0)
      }).catch(() => {})
    }
    loadBadges()
    const interval = setInterval(loadBadges, 60_000)
    return () => clearInterval(interval)
  }, [staff])

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bb-bg)] flex items-center justify-center">
        <PageLoader label="Loading imaging workspace…" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bb-bg)]">
      <div className="hidden md:block">
        <ImagingSidebar
          criticalPending={criticalPending}
          equipmentOffline={equipmentOffline}
        />
      </div>

      <ImagingHeader staff={staff ?? {}} />

      <main
        className="pt-16 pb-20 md:pb-6 transition-all duration-200 md:ml-[260px]"
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
          {children}
        </div>
      </main>
    </div>
  )
}
