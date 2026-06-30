'use client'
import { useState, useEffect } from 'react'
import { useRouter }           from 'next/navigation'
import { ScanLine, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, MapPin } from 'lucide-react'
import { cn }                  from '@/lib/utils/cn'
import { authApi }             from '@/lib/api'

export default function LoginPage() {
  const [email,      setEmail]      = useState('')
  const [password,   setPassword]   = useState('')
  const [locationId, setLocationId] = useState('')
  const [showPw,     setShowPw]     = useState(false)
  const [error,      setError]      = useState('')
  const [loading,    setLoading]    = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = document.cookie.split('; ').find(r => r.startsWith('imaging_portal_token='))?.split('=')[1]
    if (token) router.push('/portal/dashboard')
  }, [router])

  const handleLogin = async () => {
    if (!email.trim() || !password) return
    setLoading(true)
    setError('')

    try {
      const body: { email: string; password: string; locationId?: string } = {
        email:    email.trim(),
        password,
      }
      if (locationId.trim()) body.locationId = locationId.trim()

      const res  = await authApi.login(body)
      const data = await res.json().catch(() => ({})) as Record<string, unknown>

      if (!res.ok) {
        const msgs: Record<string, string> = {
          invalid_credentials: 'Invalid email or password.',
          account_inactive:    'Your account is inactive. Contact your administrator.',
          account_suspended:   'Your account has been suspended.',
          credential_expired:  'Your credential has expired. Contact your manager.',
        }
        setError(msgs[data.error as string] ?? (data.error as string) ?? 'Login failed. Please try again.')
      } else {
        router.push('/portal/dashboard')
      }
    } catch {
      setError('Network error. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, var(--imaging-primary) 0%, #152A48 100%)' }}
    >
      <div className="w-full max-w-[400px]">
        <div className="bg-white rounded-[20px] border border-[var(--bb-border)] shadow-[var(--shadow-xl)] p-8">

          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-[12px] bg-[var(--imaging-accent)] flex items-center justify-center shadow-[0_4px_12px_rgba(14,165,233,0.35)]">
              <ScanLine size={20} color="white" />
            </div>
            <div>
              <p className="text-[15px] font-bold text-[var(--bb-ink)]">Blue Boney Imaging</p>
              <p className="text-[11px] text-[var(--bb-ink-muted)]">Radiology Workspace · Secure Access</p>
            </div>
          </div>

          <h1 className="text-[18px] font-bold text-[var(--bb-ink)] mb-1">Staff Sign In</h1>
          <p className="text-[13px] text-[var(--bb-ink-muted)] mb-6">
            Use your imaging department credentials to access the workspace.
          </p>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-[10px] bg-[var(--imaging-danger-bg)] border border-[var(--imaging-danger)]/20 mb-5">
              <AlertCircle size={15} className="text-[var(--imaging-danger)] mt-0.5 shrink-0" />
              <p className="text-[12px] text-[var(--imaging-danger)]">{error}</p>
            </div>
          )}

          {/* Email */}
          <div className="mb-4">
            <label className="block text-[12px] font-semibold text-[var(--bb-ink)] mb-1.5">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--bb-ink-muted)]" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="staff@imaging.com"
                autoFocus
                className={cn(
                  'w-full pl-9 pr-4 py-2.5 rounded-[10px] border border-[var(--bb-border)] bg-white',
                  'text-[13px] text-[var(--bb-ink)] placeholder:text-[var(--bb-ink-muted)]',
                  'focus:outline-none focus:border-[var(--imaging-accent)] focus:ring-1 focus:ring-[var(--imaging-accent)]/30 transition-all',
                )}
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-[12px] font-semibold text-[var(--bb-ink)] mb-1.5">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--bb-ink-muted)]" />
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="••••••••"
                className={cn(
                  'w-full pl-9 pr-10 py-2.5 rounded-[10px] border border-[var(--bb-border)] bg-white',
                  'text-[13px] text-[var(--bb-ink)] placeholder:text-[var(--bb-ink-muted)]',
                  'focus:outline-none focus:border-[var(--imaging-accent)] focus:ring-1 focus:ring-[var(--imaging-accent)]/30 transition-all',
                )}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--bb-ink-muted)] hover:text-[var(--bb-ink)]"
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Location (optional) */}
          <div className="mb-6">
            <label className="block text-[12px] font-semibold text-[var(--bb-ink)] mb-1.5">
              Location ID <span className="font-normal text-[var(--bb-ink-muted)]">(optional)</span>
            </label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--bb-ink-muted)]" />
              <input
                type="text"
                value={locationId}
                onChange={e => setLocationId(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="Location UUID"
                className={cn(
                  'w-full pl-9 pr-4 py-2.5 rounded-[10px] border border-[var(--bb-border)] bg-white',
                  'text-[13px] text-[var(--bb-ink)] placeholder:text-[var(--bb-ink-muted)]',
                  'focus:outline-none focus:border-[var(--imaging-accent)] focus:ring-1 focus:ring-[var(--imaging-accent)]/30 transition-all',
                )}
              />
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading || !email || !password}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-3 rounded-[10px] text-[13px] font-semibold text-white transition-all',
              'bg-[var(--imaging-accent)] hover:bg-[var(--imaging-accent-hover)]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              loading && 'animate-pulse',
            )}
          >
            {loading ? 'Signing in…' : (
              <>Sign In <ArrowRight size={15} /></>
            )}
          </button>

          <p className="text-[11px] text-[var(--bb-ink-muted)] text-center mt-5">
            Forgotten your password? Contact your Imaging Manager.
          </p>
        </div>

        <p className="text-[11px] text-white/50 text-center mt-4">
          Blue Boney Health · Imaging & Radiology Workspace · Liberia
        </p>
      </div>
    </div>
  )
}
