import { type LucideIcon, Inbox } from 'lucide-react'

interface Props {
  icon?:     LucideIcon
  title:     string
  subtitle?: string
  action?:   React.ReactNode
}

export function EmptyState({ icon: Icon = Inbox, title, subtitle, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-[14px] bg-[var(--imaging-accent-bg)] flex items-center justify-center mb-4">
        <Icon size={24} className="text-[var(--imaging-accent)]" />
      </div>
      <p className="text-[15px] font-semibold text-[var(--bb-ink)] mb-1">{title}</p>
      {subtitle && <p className="text-[13px] text-[var(--bb-ink-muted)] max-w-[280px]">{subtitle}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function PageLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
      <p className="text-[13px] text-[var(--bb-ink-muted)]">{label}</p>
    </div>
  )
}
