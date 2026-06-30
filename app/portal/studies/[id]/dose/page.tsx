'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft }           from 'lucide-react'
import { PageLoader }          from '@/components/shared/EmptyState'
import { studiesApi }          from '@/lib/api'

interface Study {
  id:             string
  accession_no?:  string
  modality_type?: string
}

type Modality = 'CT' | 'XR' | 'MG' | 'NM' | 'OTHER'

function detectModality(t?: string): Modality {
  if (!t) return 'OTHER'
  const u = t.toUpperCase()
  if (u === 'CT') return 'CT'
  if (u === 'XR' || u === 'CR' || u === 'DX') return 'XR'
  if (u === 'MG') return 'MG'
  if (u === 'NM' || u === 'PT') return 'NM'
  return 'OTHER'
}

export default function DosePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [study,    setStudy]    = useState<Study | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState(false)

  // CT
  const [ctdiVol, setCtdiVol] = useState('')
  const [dlp,     setDlp]     = useState('')
  // XR
  const [dap, setDap] = useState('')
  const [esd, setEsd] = useState('')
  // MG
  const [mgd, setMgd] = useState('')
  // NM
  const [radiopharm, setRadiopharm] = useState('')
  const [mBq,        setMBq]        = useState('')

  useEffect(() => {
    ;(studiesApi.get(params.id) as Promise<{ data?: Study }>)
      .then(d => setStudy(d?.data ?? null))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [params.id])

  const modality = detectModality(study?.modality_type)

  const handleSubmit = async () => {
    setSaving(true)
    setError('')
    try {
      const body: Record<string, unknown> = {}
      if (modality === 'CT')    { body.ctdi_vol = parseFloat(ctdiVol); body.dlp = parseFloat(dlp) }
      if (modality === 'XR')    { body.dap = parseFloat(dap); body.esd = parseFloat(esd) }
      if (modality === 'MG')    { body.mgd = parseFloat(mgd) }
      if (modality === 'NM')    { body.radiopharmaceutical = radiopharm; body.administered_mBq = parseFloat(mBq) }
      await studiesApi.recordDose(params.id, body)
      setSuccess(true)
      setTimeout(() => router.push(`/portal/studies/${params.id}`), 1500)
    } catch (e: unknown) {
      setError((e as Error).message)
    }
    setSaving(false)
  }

  if (loading) return <PageLoader label="Loading study…" />

  return (
    <div className="max-w-[600px]">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-[13px] text-[var(--bb-ink-muted)] hover:text-[var(--bb-ink)] mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Study
      </button>

      <div className="mb-6">
        <h1 className="text-[18px] font-bold text-[var(--bb-ink)]">Record Radiation Dose</h1>
        <p className="text-[13px] text-[var(--bb-ink-muted)] mt-0.5">
          {study?.accession_no ?? study?.id.slice(0, 8)} — {study?.modality_type}
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">{error}</div>
      )}
      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 mb-4">
          Dose recorded successfully. Redirecting…
        </div>
      )}

      <div className="bg-white rounded-[14px] border border-[var(--bb-border)] shadow-[var(--shadow-sm)] p-6">
        {modality === 'CT' && (
          <>
            <h2 className="text-[14px] font-bold text-[var(--bb-ink)] mb-1">CT Dose Parameters</h2>
            <p className="text-[12px] text-[var(--bb-ink-muted)] mb-4">DRL Reference: CTDIvol ≤ 20 mGy (head), DLP ≤ 800 mGy·cm</p>
            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-[var(--bb-ink)] mb-1.5">CTDIvol (mGy)</label>
                <input type="number" value={ctdiVol} onChange={e => setCtdiVol(e.target.value)} placeholder="e.g. 12.5"
                  className="w-full px-3 py-2.5 rounded-[10px] border border-[var(--bb-border)] text-[13px] text-[var(--bb-ink)] focus:outline-none focus:border-[var(--imaging-accent)] focus:ring-1 focus:ring-[var(--imaging-accent)]/30 transition-all" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[var(--bb-ink)] mb-1.5">DLP (mGy·cm)</label>
                <input type="number" value={dlp} onChange={e => setDlp(e.target.value)} placeholder="e.g. 450"
                  className="w-full px-3 py-2.5 rounded-[10px] border border-[var(--bb-border)] text-[13px] text-[var(--bb-ink)] focus:outline-none focus:border-[var(--imaging-accent)] focus:ring-1 focus:ring-[var(--imaging-accent)]/30 transition-all" />
              </div>
            </div>
          </>
        )}

        {modality === 'XR' && (
          <>
            <h2 className="text-[14px] font-bold text-[var(--bb-ink)] mb-1">X-Ray Dose Parameters</h2>
            <p className="text-[12px] text-[var(--bb-ink-muted)] mb-4">DRL Reference: DAP ≤ 1.5 Gy·cm² (chest PA), ESD ≤ 0.3 mGy</p>
            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-[var(--bb-ink)] mb-1.5">DAP (Gy·cm²)</label>
                <input type="number" value={dap} onChange={e => setDap(e.target.value)} placeholder="e.g. 0.8"
                  className="w-full px-3 py-2.5 rounded-[10px] border border-[var(--bb-border)] text-[13px] text-[var(--bb-ink)] focus:outline-none focus:border-[var(--imaging-accent)] focus:ring-1 focus:ring-[var(--imaging-accent)]/30 transition-all" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[var(--bb-ink)] mb-1.5">ESD (mGy)</label>
                <input type="number" value={esd} onChange={e => setEsd(e.target.value)} placeholder="e.g. 0.2"
                  className="w-full px-3 py-2.5 rounded-[10px] border border-[var(--bb-border)] text-[13px] text-[var(--bb-ink)] focus:outline-none focus:border-[var(--imaging-accent)] focus:ring-1 focus:ring-[var(--imaging-accent)]/30 transition-all" />
              </div>
            </div>
          </>
        )}

        {modality === 'MG' && (
          <>
            <h2 className="text-[14px] font-bold text-[var(--bb-ink)] mb-1">Mammography Dose Parameters</h2>
            <p className="text-[12px] text-[var(--bb-ink-muted)] mb-4">DRL Reference: MGD ≤ 2.5 mGy per view</p>
            <div>
              <label className="block text-[12px] font-semibold text-[var(--bb-ink)] mb-1.5">MGD (mGy)</label>
              <input type="number" value={mgd} onChange={e => setMgd(e.target.value)} placeholder="e.g. 1.8"
                className="w-full px-3 py-2.5 rounded-[10px] border border-[var(--bb-border)] text-[13px] text-[var(--bb-ink)] focus:outline-none focus:border-[var(--imaging-accent)] focus:ring-1 focus:ring-[var(--imaging-accent)]/30 transition-all" />
            </div>
          </>
        )}

        {modality === 'NM' && (
          <>
            <h2 className="text-[14px] font-bold text-[var(--bb-ink)] mb-1">Nuclear Medicine Dose</h2>
            <p className="text-[12px] text-[var(--bb-ink-muted)] mb-4">Record the radiopharmaceutical administered</p>
            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-[var(--bb-ink)] mb-1.5">Radiopharmaceutical</label>
                <input type="text" value={radiopharm} onChange={e => setRadiopharm(e.target.value)} placeholder="e.g. Tc-99m MDP"
                  className="w-full px-3 py-2.5 rounded-[10px] border border-[var(--bb-border)] text-[13px] text-[var(--bb-ink)] focus:outline-none focus:border-[var(--imaging-accent)] focus:ring-1 focus:ring-[var(--imaging-accent)]/30 transition-all" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[var(--bb-ink)] mb-1.5">Administered Activity (MBq)</label>
                <input type="number" value={mBq} onChange={e => setMBq(e.target.value)} placeholder="e.g. 740"
                  className="w-full px-3 py-2.5 rounded-[10px] border border-[var(--bb-border)] text-[13px] text-[var(--bb-ink)] focus:outline-none focus:border-[var(--imaging-accent)] focus:ring-1 focus:ring-[var(--imaging-accent)]/30 transition-all" />
              </div>
            </div>
          </>
        )}

        {modality === 'OTHER' && (
          <p className="text-[13px] text-[var(--bb-ink-muted)]">
            Dose recording is not configured for modality: {study?.modality_type ?? 'Unknown'}
          </p>
        )}

        {modality !== 'OTHER' && (
          <button
            onClick={handleSubmit}
            disabled={saving || success}
            className="mt-6 w-full py-3 rounded-[10px] bg-[var(--imaging-accent)] text-white text-[13px] font-semibold hover:bg-[var(--imaging-accent-hover)] disabled:opacity-50 transition-colors"
          >
            {saving ? 'Recording…' : 'Record Dose'}
          </button>
        )}
      </div>
    </div>
  )
}
