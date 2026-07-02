import { type LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface Trend {
  value: number
  direction: 'up' | 'down'
  label?: string
}

interface KPICardProps {
  // Canonical name (superset)
  title?: string
  // Backward-compat alias for title
  label?: string
  value: string | number
  // Canonical name (superset)
  subtitle?: string
  // Backward-compat alias for subtitle
  sub?: string
  // Optional — imaging call sites pass this; non-imaging callers may omit
  icon?: LucideIcon
  // Imaging-specific variant theming (preserved for backward compat)
  variant?: 'default' | 'warning' | 'danger' | 'critical' | 'success' | 'stat'
  // Imaging-specific action badge (preserved for backward compat)
  badge?: string
  trend?: Trend
  alert?: boolean
  className?: string
}

const iconStyles: Record<NonNullable<KPICardProps['variant']>, string> = {
  default:  'bg-[var(--imaging-accent-bg)] text-[var(--imaging-accent)]',
  warning:  'bg-[var(--imaging-warning-bg)] text-[var(--imaging-warning)]',
  danger:   'bg-[var(--imaging-danger-bg)] text-[var(--imaging-danger)]',
  critical: 'bg-[var(--imaging-critical-bg)] text-[var(--imaging-critical)]',
  success:  'bg-[var(--imaging-success-bg)] text-[var(--imaging-success)]',
  stat:     'bg-[var(--imaging-warning-bg)] text-[var(--imaging-stat)]',
}

const valuePalette: Record<NonNullable<KPICardProps['variant']>, string> = {
  default:  'text-[var(--bb-ink)]',
  warning:  'text-[var(--imaging-warning)]',
  danger:   'text-[var(--imaging-danger)]',
  critical: 'text-[var(--imaging-critical)]',
  success:  'text-[var(--imaging-success)]',
  stat:     'text-[var(--imaging-stat)]',
}

export function KPICard({
  title,
  label,
  value,
  subtitle,
  sub,
  icon: Icon,
  variant = 'default',
  badge,
  trend,
  alert: isAlert,
  className,
}: KPICardProps) {
  const heading = title ?? label ?? ''
  const subtext = subtitle ?? sub

  return (
    <div
      className={cn(
        'bg-white rounded-[14px] border border-[var(--bb-border)] shadow-[var(--shadow-sm)] p-5',
        isAlert && 'ring-2 ring-red-400',
        className,
      )}
    >
      {(Icon || badge) && (
        <div className="flex items-start justify-between mb-3">
          {Icon && (
            <div className={cn('w-10 h-10 rounded-[10px] flex items-center justify-center', iconStyles[variant])}>
              <Icon size={18} />
            </div>
          )}
          {badge && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--imaging-critical-bg)] text-[var(--imaging-critical)]">
              {badge}
            </span>
          )}
        </div>
      )}
      <p className={cn('text-[28px] font-bold leading-none mb-1', valuePalette[variant])}>{value}</p>
      <p className="text-[12px] font-semibold text-[var(--bb-ink)] mb-0.5">{heading}</p>
      {subtext && <p className="text-[11px] text-[var(--bb-ink-muted)]">{subtext}</p>}
      {trend && (
        <div
          className={`flex items-center gap-1 mt-2 text-[12px] font-medium ${
            trend.direction === 'up' ? 'text-emerald-600' : 'text-red-500'
          }`}
        >
          {trend.direction === 'up' ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          <span>
            {trend.value > 0 ? '+' : ''}
            {trend.value}%
          </span>
          {trend.label && (
            <span className="text-[var(--bb-ink-muted)] font-normal ml-1">{trend.label}</span>
          )}
        </div>
      )}
    </div>
  )
}
