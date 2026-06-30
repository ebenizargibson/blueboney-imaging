import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface Props {
  title:     string
  value:     string | number
  icon:      LucideIcon
  variant?:  'default' | 'warning' | 'danger' | 'critical' | 'success' | 'stat'
  subtitle?: string
  badge?:    string
}

const iconStyles = {
  default:  'bg-[var(--imaging-accent-bg)] text-[var(--imaging-accent)]',
  warning:  'bg-[var(--imaging-warning-bg)] text-[var(--imaging-warning)]',
  danger:   'bg-[var(--imaging-danger-bg)] text-[var(--imaging-danger)]',
  critical: 'bg-[var(--imaging-critical-bg)] text-[var(--imaging-critical)]',
  success:  'bg-[var(--imaging-success-bg)] text-[var(--imaging-success)]',
  stat:     'bg-[var(--imaging-warning-bg)] text-[var(--imaging-stat)]',
}

const valuePalette = {
  default:  'text-[var(--bb-ink)]',
  warning:  'text-[var(--imaging-warning)]',
  danger:   'text-[var(--imaging-danger)]',
  critical: 'text-[var(--imaging-critical)]',
  success:  'text-[var(--imaging-success)]',
  stat:     'text-[var(--imaging-stat)]',
}

export function KPICard({ title, value, icon: Icon, variant = 'default', subtitle, badge }: Props) {
  return (
    <div className="bg-white rounded-[14px] border border-[var(--bb-border)] shadow-[var(--shadow-sm)] p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={cn('w-10 h-10 rounded-[10px] flex items-center justify-center', iconStyles[variant])}>
          <Icon size={18} />
        </div>
        {badge && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--imaging-critical-bg)] text-[var(--imaging-critical)]">
            {badge}
          </span>
        )}
      </div>
      <p className={cn('text-[28px] font-bold leading-none mb-1', valuePalette[variant])}>{value}</p>
      <p className="text-[12px] font-semibold text-[var(--bb-ink)] mb-0.5">{title}</p>
      {subtitle && <p className="text-[11px] text-[var(--bb-ink-muted)]">{subtitle}</p>}
    </div>
  )
}
