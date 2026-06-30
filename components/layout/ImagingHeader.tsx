'use client'
import { useRouter }  from 'next/navigation'
import { useState }   from 'react'
import { LogOut, ChevronDown, User2, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface StaffInfo {
  fullName?:  string
  email?:     string
  role?:      string
  locationId?: string
}

const ROLE_LABELS: Record<string, string> = {
  radiologist:         'Radiologist',
  technologist:        'Radiology Technologist',
  technician:          'Imaging Technician',
  radiographer:        'Radiographer',
  nuclear_medicine:    'Nuclear Medicine Specialist',
  sonographer:         'Sonographer',
  scheduling_coordinator: 'Scheduling Coordinator',
  charge_technologist: 'Charge Technologist',
  admin:               'Administrator',
  manager:             'Imaging Manager',
}

interface Props {
  staff:     StaffInfo
  collapsed?: boolean
}

export function ImagingHeader({ staff, collapsed = false }: Props) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await fetch('https://blueboney.vercel.app/api/imaging/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch { /* ignore */ }
    router.push('/login')
  }

  return (
    <header
      className={cn(
        'fixed right-0 top-0 h-[var(--topbar-h)] bg-white border-b border-[var(--bb-border)]',
        'flex items-center justify-between px-5 z-20 transition-all duration-200',
      )}
      style={{ left: collapsed ? 64 : 260 }}
    >
      {/* Left: location */}
      <div className="flex items-center gap-2 text-[var(--bb-ink-muted)]">
        <MapPin size={14} />
        <span className="text-[12px]">
          {staff.locationId ? 'Location active' : 'No location selected'}
        </span>
      </div>

      {/* Right: staff menu */}
      <div className="relative flex items-center gap-3">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-[8px] hover:bg-[var(--bb-bg2)] transition-all"
        >
          <div className="w-7 h-7 rounded-full bg-[var(--imaging-accent)] flex items-center justify-center">
            <User2 size={14} color="white" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-[12px] font-semibold text-[var(--bb-ink)] leading-none">{staff.fullName ?? 'Staff'}</p>
            <p className="text-[10px] text-[var(--bb-ink-muted)]">{ROLE_LABELS[staff.role ?? ''] ?? staff.role ?? ''}</p>
          </div>
          <ChevronDown size={13} className="text-[var(--bb-ink-muted)]" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-[12px] border border-[var(--bb-border)] shadow-[var(--shadow-lg)] z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--bb-border)]">
              <p className="text-[12px] font-semibold text-[var(--bb-ink)]">{staff.fullName}</p>
              <p className="text-[11px] text-[var(--bb-ink-muted)]">{staff.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-3 text-[13px] text-[var(--imaging-danger)] hover:bg-[var(--imaging-danger-bg)] transition-all"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
