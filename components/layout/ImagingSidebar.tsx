'use client'
import Link            from 'next/link'
import { usePathname } from 'next/navigation'
import { useState }    from 'react'
import {
  LayoutDashboard, ClipboardList, CalendarDays, Layers, Stethoscope,
  FileText, AlertTriangle, Wrench, ClipboardCheck, Package,
  Receipt, FolderOpen, BarChart3, Settings, ScanLine,
  ChevronLeft, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface NavItem {
  href:  string
  icon:  React.ComponentType<{ size?: number; className?: string }>
  label: string
  badge?: number
  badgeVariant?: 'danger' | 'warning' | 'stat'
}

const NAV: NavItem[] = [
  { href: '/portal/dashboard',        icon: LayoutDashboard,  label: 'Dashboard' },
  { href: '/portal/orders',           icon: ClipboardList,    label: 'Orders' },
  { href: '/portal/scheduling',       icon: CalendarDays,     label: 'Scheduling' },
  { href: '/portal/queue',            icon: Layers,           label: 'Imaging Queue' },
  { href: '/portal/worklist',         icon: Stethoscope,      label: 'Worklist' },
  { href: '/portal/reporting',        icon: FileText,         label: 'Reporting' },
  { href: '/portal/critical-findings', icon: AlertTriangle,   label: 'Critical Findings' },
  { href: '/portal/equipment',        icon: Wrench,           label: 'Equipment' },
  { href: '/portal/qa',               icon: ClipboardCheck,   label: 'QA' },
  { href: '/portal/inventory',        icon: Package,          label: 'Inventory' },
  { href: '/portal/billing',          icon: Receipt,          label: 'Billing' },
  { href: '/portal/documents',        icon: FolderOpen,       label: 'Documents' },
  { href: '/portal/reports',          icon: BarChart3,        label: 'Reports' },
  { href: '/portal/settings',         icon: Settings,         label: 'Settings' },
]

interface Props {
  criticalPending?: number
  equipmentOffline?: number
}

export function ImagingSidebar({ criticalPending = 0, equipmentOffline = 0 }: Props) {
  const pathname  = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const isActive = (href: string) =>
    pathname === href || (href !== '/portal/dashboard' && pathname.startsWith(href + '/'))

  const badgeFor = (href: string): { count: number; variant: 'danger' | 'warning' | 'stat' } | null => {
    if (href === '/portal/critical-findings' && criticalPending > 0) return { count: criticalPending, variant: 'danger' }
    if (href === '/portal/equipment' && equipmentOffline > 0) return { count: equipmentOffline, variant: 'warning' }
    return null
  }

  const BadgeDot = ({ count, variant }: { count: number; variant: 'danger' | 'warning' | 'stat' }) => {
    const colors = {
      danger:  'bg-[var(--imaging-critical)] text-white',
      warning: 'bg-[var(--imaging-warning)] text-white',
      stat:    'bg-[var(--imaging-stat)] text-white',
    }
    return (
      <span className={cn(
        'text-[10px] font-bold rounded-full flex items-center justify-center min-w-[18px] h-[18px] px-1',
        colors[variant],
        collapsed ? 'absolute top-1.5 right-1.5 w-4 h-4 min-w-0' : '',
      )}>
        {count > 9 ? '9+' : count}
      </span>
    )
  }

  return (
    <aside className={cn(
      'fixed left-0 top-0 h-full flex flex-col z-30 transition-all duration-200',
      'bg-[var(--imaging-primary)] border-r border-[#162D4A]',
      collapsed ? 'w-[64px]' : 'w-[260px]',
    )}>
      {/* Logo */}
      <div className={cn(
        'flex items-center gap-3 px-4 py-5 border-b border-[#162D4A]',
        collapsed && 'justify-center px-2',
      )}>
        <div className="w-9 h-9 rounded-[10px] bg-[var(--imaging-accent)] flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(14,165,233,0.35)]">
          <ScanLine size={17} color="white" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-[13px] font-bold text-white">Blue Boney</p>
            <p className="text-[10px] text-[#94B8D4] font-medium">Imaging Workspace</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {NAV.map(item => {
          const active = isActive(item.href)
          const badge  = badgeFor(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[13px] font-medium transition-all mb-0.5 relative',
                active
                  ? 'bg-[var(--imaging-accent)] text-white'
                  : 'text-[#94B8D4] hover:bg-[#162D4A] hover:text-white',
                collapsed && 'justify-center px-0',
              )}
            >
              <item.icon size={18} className="shrink-0" />
              {!collapsed && <span className="flex-1">{item.label}</span>}
              {badge ? <BadgeDot count={badge.count} variant={badge.variant} /> : null}
            </Link>
          )
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-3 border-t border-[#162D4A]">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-[8px] text-[12px] text-[#94B8D4] hover:bg-[#162D4A] hover:text-white transition-all"
        >
          {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span>Collapse</span></>}
        </button>
      </div>
    </aside>
  )
}
