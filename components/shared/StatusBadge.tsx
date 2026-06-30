import { cn } from '@/lib/utils/cn'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'critical' | 'stat' | 'accent' | 'neutral'

const variants: Record<BadgeVariant, string> = {
  default:  'bg-[var(--imaging-neutral-bg)] text-[var(--imaging-neutral)]',
  success:  'bg-[var(--imaging-success-bg)] text-[var(--imaging-success)]',
  warning:  'bg-[var(--imaging-warning-bg)] text-[var(--imaging-warning)]',
  danger:   'bg-[var(--imaging-danger-bg)] text-[var(--imaging-danger)]',
  critical: 'bg-[var(--imaging-critical-bg)] text-[var(--imaging-critical)]',
  stat:     'bg-[var(--imaging-warning-bg)] text-[var(--imaging-stat)]',
  accent:   'bg-[var(--imaging-accent-bg)] text-[var(--imaging-accent)]',
  neutral:  'bg-[var(--imaging-neutral-bg)] text-[var(--imaging-neutral)]',
}

interface Props {
  label:    string
  variant?: BadgeVariant
  className?: string
}

export function StatusBadge({ label, variant = 'default', className }: Props) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide',
      variants[variant],
      className,
    )}>
      {label}
    </span>
  )
}

export function priorityVariant(priority: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    stat:     'critical',
    urgent:   'stat',
    routine:  'default',
    elective: 'neutral',
  }
  return map[priority?.toLowerCase()] ?? 'default'
}

export function statusVariant(status: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    scheduled:       'accent',
    received:        'neutral',
    in_progress:     'warning',
    acquired:        'accent',
    interpreting:    'stat',
    completed:       'success',
    signed:          'success',
    cancelled:       'neutral',
    draft:           'warning',
    preliminary:     'stat',
    pending:         'neutral',
    active:          'success',
    offline:         'critical',
    maintenance:     'warning',
    decommissioned:  'neutral',
    checked_in:      'success',
    in_prep:         'accent',
    no_show:         'danger',
    claimed:         'warning',
    submitted:       'accent',
    approved:        'success',
    denied:          'danger',
    appealed:        'stat',
  }
  return map[status?.toLowerCase()] ?? 'default'
}
