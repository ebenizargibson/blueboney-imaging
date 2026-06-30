'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Save, CheckCircle, PenLine, History } from 'lucide-react'
import { PageLoader }          from '@/components/shared/EmptyState'
import { StatusBadge, statusVariant } from '@/components/shared/StatusBadge'
import { reportsApi }          from '@/lib/api'

interface Report {
  id:                     string
  study_accession?:       string
  status?:                string
  clinical_indication?:   string
  technique?:             string
  comparison?:            string
  findings?:              string
  impression?:            string
  recommendations?:       string
  follow_up_required?:    boolean
  follow_up_timeframe?:   string
  ai_assisted?:           boolean
  ai_system_name?:        string
  radiologist_name?:      string
}

interface Version {
  id:         string
  version_no: number
  created_at: string
  edited_by?: string
}

export default function ReportEditorPage() {
  const params = useParams<{ reportId: string }>()
  const router = useRouter()
  const [report,    setReport]    = useState<Report | null>(null)
  const [versions,  setVersions]  = useState<Version[]>([])
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [signing,   setSigning]   = useState(false)
  const [error,     setError]     = useState('')
  const [showVersions, setShowVersions] = useState(false)
  const [showAmend,    setShowAmend]    = useState(false)
  const [amendReason,  setAmendReason]  = useState('')

  // Form state
  const [indication,    setIndication]    = useState('')
  const [technique,     setTechnique]     = useState('')
  const [comparison,    setComparison]    = useState('')
  const [findings,      setFindings]      = useState('')
  const [impression,    setImpression]    = useState('')
  const [recommendations, setRecommendations] = useState('')
  const [followUp,      setFollowUp]      = useState(false)
  const [followUpTime,  setFollowUpTime]  = useState('')
  const [aiAssisted,    setAiAssisted]    = useState(false)
  const [aiSystem,      setAiSystem]      = useState('')

  useEffect(() => {
    ;(reportsApi.get(params.reportId) as Promise<{ data?: Report }>)
      .then(d => {
        const r = d?.data
        if (!r) return
        setReport(r)
        setIndication(r.clinical_indication ?? '')
        setTechnique(r.technique ?? '')
        setComparison(r.comparison ?? '')
        setFindings(r.findings ?? '')
        setImpression(r.impression ?? '')
        setRecommendations(r.recommendations ?? '')
        setFollowUp(r.follow_up_required ?? false)
        setFollowUpTime(r.follow_up_timeframe ?? '')
        setAiAssisted(r.ai_assisted ?? false)
        setAiSystem(r.ai_system_name ?? '')
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [params.reportId])

  const saveDraft = async () => {
    setSaving(true)
    setError('')
    try {
      await reportsApi.patch(params.reportId, {
        clinical_indication: indication,
        technique,
        comparison,
        findings,
        impression,
        recommendations,
        follow_up_required: followUp,
        follow_up_timeframe: followUpTime,
        ai_assisted: aiAssisted,
        ai_system_name: aiSystem,
      })
      const d = await reportsApi.get(params.reportId) as { data?: Report }
      setReport(d?.data ?? null)
    } catch (e: unknown) { setError((e as Error).message) }
    setSaving(false)
  }

  const signReport = async () => {
    setSigning(true)
    setError('')
    try {
      await reportsApi.sign(params.reportId)
      router.push('/portal/reporting')
    } catch (e: unknown) { setError((e as Error).message) }
    setSigning(false)
  }

  const submitAmend = async () => {
    if (!amendReason.trim()) return
    try {
      await reportsApi.amend(params.reportId, { amendment_reason: amendReason })
      setShowAmend(false)
      setAmendReason('')
    } catch (e: unknown) { setError((e as Error).message) }
  }

  const loadVersions = async () => {
    try {
      const d = await reportsApi.getVersions(params.reportId) as { data?: Version[] }
      setVersions(d?.data ?? [])
      setShowVersions(true)
    } catch { /* ignore */ }
  }

  if (loading) return <PageLoader label="Loading report…" />

  const isDraft = report?.status === 'draft' || report?.status === 'preliminary'

  const TA = ({
    label, value, onChange, rows = 4, required = false,
  }: { label: string; value: string; onChange: (v: string) => void; rows?: number; required?: boolean }) => (
    <div className="mb-4">
      <label className="block text-[12px] font-semibold text-[var(--bb-ink)] mb-1.5">
        {label}{required && <span className="text-[var(--imaging-critical)] ml-0.5">*</span>}
      </label>
      <textarea
        rows={rows}
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={!isDraft}
        className="w-full px-3 py-2.5 rounded-[10px] border border-[var(--bb-border)] text-[13px] text-[var(--bb-ink)] resize-none focus:outline-none focus:border-[var(--imaging-accent)] focus:ring-1 focus:ring-[var(--imaging-accent)]/30 transition-all disabled:bg-[var(--bb-bg)] disabled:text-[var(--bb-ink-muted)]"
      />
    </div>
  )

  return (
    <div className="max-w-[900px]">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-[13px] text-[var(--bb-ink-muted)] hover:text-[var(--bb-ink)] mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Reporting
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[18px] font-bold text-[var(--bb-ink)]">
            Report — {report?.study_accession ?? params.reportId.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-[12px] text-[var(--bb-ink-muted)] mt-0.5">{report?.radiologist_name ?? 'Unassigned'}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge label={report?.status ?? 'draft'} variant={statusVariant(report?.status ?? '')} />
          <button onClick={loadVersions} className="p-2 rounded-[8px] border border-[var(--bb-border)] text-[var(--bb-ink-muted)] hover:bg-[var(--bb-bg2)] transition-colors" title="Version history">
            <History size={15} />
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">{error}</div>
      )}

      <div className="bg-white rounded-[14px] border border-[var(--bb-border)] shadow-[var(--shadow-sm)] p-6">
        <TA label="Clinical Indication" value={indication} onChange={setIndication} />
        <TA label="Technique" value={technique} onChange={setTechnique} />
        <TA label="Comparison" value={comparison} onChange={setComparison} />
        <TA label="Findings" value={findings} onChange={setFindings} rows={8} required />
        <TA label="Impression" value={impression} onChange={setImpression} rows={4} required />
        <TA label="Recommendations" value={recommendations} onChange={setRecommendations} />

        <div className="flex items-center gap-6 mt-2 mb-4">
          <label className="flex items-center gap-2 text-[13px] cursor-pointer">
            <input type="checkbox" checked={followUp} onChange={e => setFollowUp(e.target.checked)} disabled={!isDraft}
              className="rounded border-[var(--bb-border)] accent-[var(--imaging-accent)]" />
            <span className="text-[var(--bb-ink)]">Follow-up required</span>
          </label>
          {followUp && (
            <input type="text" value={followUpTime} onChange={e => setFollowUpTime(e.target.value)} placeholder="Timeframe (e.g. 6 months)" disabled={!isDraft}
              className="flex-1 px-3 py-1.5 rounded-[8px] border border-[var(--bb-border)] text-[13px] text-[var(--bb-ink)] focus:outline-none focus:border-[var(--imaging-accent)] focus:ring-1 focus:ring-[var(--imaging-accent)]/30 transition-all disabled:bg-[var(--bb-bg)]" />
          )}
        </div>

        <div className="flex items-center gap-6 mb-6">
          <label className="flex items-center gap-2 text-[13px] cursor-pointer">
            <input type="checkbox" checked={aiAssisted} onChange={e => setAiAssisted(e.target.checked)} disabled={!isDraft}
              className="rounded border-[var(--bb-border)] accent-[var(--imaging-accent)]" />
            <span className="text-[var(--bb-ink)]">AI-assisted interpretation</span>
          </label>
          {aiAssisted && (
            <input type="text" value={aiSystem} onChange={e => setAiSystem(e.target.value)} placeholder="AI system name" disabled={!isDraft}
              className="flex-1 px-3 py-1.5 rounded-[8px] border border-[var(--bb-border)] text-[13px] text-[var(--bb-ink)] focus:outline-none focus:border-[var(--imaging-accent)] focus:ring-1 focus:ring-[var(--imaging-accent)]/30 transition-all disabled:bg-[var(--bb-bg)]" />
          )}
        </div>

        <div className="flex gap-3 pt-4 border-t border-[var(--bb-border)]">
          {isDraft && (
            <>
              <button onClick={saveDraft} disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-[8px] border border-[var(--imaging-accent)] text-[var(--imaging-accent)] text-[13px] font-medium hover:bg-[var(--imaging-accent-bg)] disabled:opacity-50 transition-colors">
                <Save size={14} /> {saving ? 'Saving…' : 'Save Draft'}
              </button>
              <button onClick={signReport} disabled={signing || !findings || !impression}
                className="flex items-center gap-2 px-4 py-2 rounded-[8px] bg-[var(--imaging-accent)] text-white text-[13px] font-medium hover:bg-[var(--imaging-accent-hover)] disabled:opacity-50 transition-colors">
                <CheckCircle size={14} /> {signing ? 'Signing…' : 'Sign & Finalize'}
              </button>
            </>
          )}
          {report?.status === 'signed' && (
            <button onClick={() => setShowAmend(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-[8px] border border-[var(--imaging-stat)] text-[var(--imaging-stat)] text-[13px] font-medium hover:bg-[var(--imaging-warning-bg)] transition-colors">
              <PenLine size={14} /> Add Addendum
            </button>
          )}
        </div>
      </div>

      {/* Version history modal */}
      {showVersions && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[16px] w-full max-w-[500px] p-6 shadow-[var(--shadow-xl)]">
            <h3 className="text-[16px] font-bold text-[var(--bb-ink)] mb-4">Version History</h3>
            {versions.length === 0 ? (
              <p className="text-[13px] text-[var(--bb-ink-muted)]">No versions available.</p>
            ) : (
              <ul className="space-y-2 max-h-[300px] overflow-y-auto">
                {versions.map(v => (
                  <li key={v.id} className="flex items-center justify-between p-3 rounded-[8px] bg-[var(--bb-bg)]">
                    <div>
                      <span className="text-[12px] font-semibold text-[var(--bb-ink)]">Version {v.version_no}</span>
                      {v.edited_by && <span className="ml-2 text-[11px] text-[var(--bb-ink-muted)]">by {v.edited_by}</span>}
                    </div>
                    <span className="text-[11px] text-[var(--bb-ink-muted)]">{new Date(v.created_at).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            )}
            <button onClick={() => setShowVersions(false)} className="mt-4 w-full py-2 rounded-[8px] border border-[var(--bb-border)] text-[13px] text-[var(--bb-ink-muted)] hover:bg-[var(--bb-bg2)] transition-colors">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Amend modal */}
      {showAmend && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[16px] w-full max-w-[500px] p-6 shadow-[var(--shadow-xl)]">
            <h3 className="text-[16px] font-bold text-[var(--bb-ink)] mb-2">Add Addendum</h3>
            <p className="text-[13px] text-[var(--bb-ink-muted)] mb-4">Provide the reason for this amendment.</p>
            <textarea
              rows={4}
              value={amendReason}
              onChange={e => setAmendReason(e.target.value)}
              placeholder="Reason for amendment…"
              className="w-full px-3 py-2.5 rounded-[10px] border border-[var(--bb-border)] text-[13px] text-[var(--bb-ink)] resize-none focus:outline-none focus:border-[var(--imaging-accent)] focus:ring-1 focus:ring-[var(--imaging-accent)]/30 transition-all mb-4"
            />
            <div className="flex gap-2">
              <button onClick={submitAmend} disabled={!amendReason.trim()}
                className="flex-1 py-2 rounded-[8px] bg-[var(--imaging-accent)] text-white text-[13px] font-medium disabled:opacity-50">
                Submit Addendum
              </button>
              <button onClick={() => setShowAmend(false)}
                className="flex-1 py-2 rounded-[8px] border border-[var(--bb-border)] text-[13px] text-[var(--bb-ink-muted)] hover:bg-[var(--bb-bg2)]">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
