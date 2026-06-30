'use client'
import { useState, useEffect } from 'react'
import { FolderOpen }          from 'lucide-react'
import { PageLoader, EmptyState } from '@/components/shared/EmptyState'
import { documentsApi }        from '@/lib/api'

interface Doc {
  id:          string
  title?:      string
  doc_type?:   string
  uploaded_at?: string
  file_size?:  number
  url?:        string
}

function formatSize(bytes?: number): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

export default function DocumentsPage() {
  const [docs,    setDocs]    = useState<Doc[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    ;(documentsApi.list({ limit: 50 }) as Promise<{ data?: Doc[] }>)
      .then(d => setDocs(d?.data ?? []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[var(--bb-ink)]">Documents</h1>
        <p className="text-[13px] text-[var(--bb-ink-muted)] mt-0.5">Policies, protocols, LMHRA submissions, and SOPs.</p>
      </div>

      {loading ? <PageLoader label="Loading documents…" /> : error ? (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : docs.length === 0 ? (
        <EmptyState icon={FolderOpen} title="No documents" subtitle="No documents have been uploaded yet." />
      ) : (
        <div className="bg-white rounded-[14px] border border-[var(--bb-border)] shadow-[var(--shadow-sm)] overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[var(--bb-border)] text-[var(--bb-ink-muted)] text-[11px] font-semibold uppercase tracking-wide">
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">Uploaded</th>
                <th className="text-right px-4 py-3">Size</th>
              </tr>
            </thead>
            <tbody>
              {docs.map(doc => (
                <tr key={doc.id} className="border-t border-[var(--bb-border)] hover:bg-[var(--bb-bg)] transition-colors">
                  <td className="px-4 py-3">
                    {doc.url ? (
                      <a href={doc.url} target="_blank" rel="noopener noreferrer"
                        className="font-medium text-[var(--imaging-accent)] hover:underline">
                        {doc.title ?? 'Untitled'}
                      </a>
                    ) : (
                      <span className="font-medium text-[var(--bb-ink)]">{doc.title ?? 'Untitled'}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[var(--bb-ink-muted)] capitalize">{doc.doc_type?.replace(/_/g, ' ') ?? '—'}</td>
                  <td className="px-4 py-3 text-[var(--bb-ink-muted)]">
                    {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-[var(--bb-ink-muted)]">{formatSize(doc.file_size)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
