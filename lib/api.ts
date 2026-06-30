'use client'

import { getToken } from './auth'

const BASE = 'https://blueboney.vercel.app/api/imaging'

async function req<T = unknown>(
  method: string,
  path: string,
  body?: unknown,
  extraHeaders?: Record<string, string>,
): Promise<T> {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...extraHeaders,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw Object.assign(new Error(data?.error ?? res.statusText), { status: res.status, data })
  return data as T
}

function get<T = unknown>(path: string, params?: Record<string, string | number | undefined>) {
  const url = params
    ? `${path}?${new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      ).toString()}`
    : path
  return req<T>('GET', url)
}

function post<T = unknown>(path: string, body: unknown) {
  return req<T>('POST', path, body)
}

function patch<T = unknown>(path: string, body: unknown) {
  return req<T>('PATCH', path, body)
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export const authApi = {
  login:     (body: { email: string; password: string; locationId?: string }) =>
    fetch(`${BASE}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  logout:    () => post('/auth/logout', {}),
  me:        () => get('/auth/me'),
  verifyPin: (body: { pin: string }) => post('/auth/pin/verify', body),
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export const dashboardApi = {
  getKPIs: () => get('/dashboard'),
}

// ── Orders ────────────────────────────────────────────────────────────────────

export const ordersApi = {
  list:           (p?: Record<string, string | number | undefined>) => get('/orders', p),
  get:            (id: string) => get(`/orders/${id}`),
  patch:          (id: string, body: unknown) => patch(`/orders/${id}`, body),
  assignProtocol: (id: string, body: unknown) => post(`/orders/${id}/assign-protocol`, body),
  cancel:         (id: string, body: unknown) => post(`/orders/${id}/cancel`, body),
}

// ── Appointments ──────────────────────────────────────────────────────────────

export const appointmentsApi = {
  list:                   (p?: Record<string, string | number | undefined>) => get('/appointments', p),
  get:                    (id: string) => get(`/appointments/${id}`),
  create:                 (body: unknown) => post('/appointments', body),
  patch:                  (id: string, body: unknown) => patch(`/appointments/${id}`, body),
  cancel:                 (id: string, body: unknown) => post(`/appointments/${id}/cancel`, body),
  checkin:                (id: string) => post(`/appointments/${id}/checkin`, {}),
  getPrep:                (id: string) => get(`/appointments/${id}/prep`),
  postPrep:               (id: string, body: unknown) => post(`/appointments/${id}/prep`, body),
  getContrastScreening:   (id: string) => get(`/appointments/${id}/contrast-screening`),
  postContrastScreening:  (id: string, body: unknown) => post(`/appointments/${id}/contrast-screening`, body),
  postConsent:            (id: string, body: unknown) => post(`/appointments/${id}/consent`, body),
}

// ── Slots ─────────────────────────────────────────────────────────────────────

export const slotsApi = {
  list: (p?: Record<string, string | number | undefined>) => get('/slots', p),
}

// ── Studies ───────────────────────────────────────────────────────────────────

export const studiesApi = {
  list:       (p?: Record<string, string | number | undefined>) => get('/studies', p),
  get:        (id: string) => get(`/studies/${id}`),
  patch:      (id: string, body: unknown) => patch(`/studies/${id}`, body),
  complete:   (id: string) => post(`/studies/${id}/complete`, {}),
  recordDose: (id: string, body: unknown) => post(`/studies/${id}/dose`, body),
  getSeries:  (id: string) => get(`/studies/${id}/series`),
}

// ── Worklist ──────────────────────────────────────────────────────────────────

export const worklistApi = {
  list:    (p?: Record<string, string | number | undefined>) => get('/worklist', p),
  get:     (id: string) => get(`/worklist/${id}`),
  claim:   (id: string) => post(`/worklist/${id}/claim`, {}),
  release: (id: string) => post(`/worklist/${id}/release`, {}),
}

// ── Reports ───────────────────────────────────────────────────────────────────

export const reportsApi = {
  list:        (p?: Record<string, string | number | undefined>) => get('/reports', p),
  get:         (id: string) => get(`/reports/${id}`),
  create:      (body: unknown) => post('/reports', body),
  patch:       (id: string, body: unknown) => patch(`/reports/${id}`, body),
  sign:        (id: string) => post(`/reports/${id}/sign`, {}),
  amend:       (id: string, body: unknown) => post(`/reports/${id}/amend`, body),
  getVersions: (id: string) => get(`/reports/${id}/versions`),
}

// ── Critical Findings ─────────────────────────────────────────────────────────

export const criticalApi = {
  list:           (p?: Record<string, string | number | undefined>) => get('/critical-findings', p),
  get:            (id: string) => get(`/critical-findings/${id}`),
  create:         (body: unknown) => post('/critical-findings', body),
  patch:          (id: string, body: unknown) => patch(`/critical-findings/${id}`, body),
  recordNotify:   (id: string, body: unknown) => post(`/critical-findings/${id}/notify`, body),
  acknowledge:    (id: string, body: unknown) => post(`/critical-findings/${id}/acknowledge`, body),
  escalate:       (id: string, body: unknown) => post(`/critical-findings/${id}/escalate`, body),
}

// ── Equipment ─────────────────────────────────────────────────────────────────

export const equipmentApi = {
  list:           (p?: Record<string, string | number | undefined>) => get('/equipment', p),
  get:            (id: string) => get(`/equipment/${id}`),
  create:         (body: unknown) => post('/equipment', body),
  patch:          (id: string, body: unknown) => patch(`/equipment/${id}`, body),
  logMaintenance: (id: string, body: unknown) => post(`/equipment/${id}/maintenance`, body),
  startDowntime:  (id: string, body: unknown) => post(`/equipment/${id}/downtime`, body),
  restore:        (id: string) => post(`/equipment/${id}/restore`, {}),
}

// ── QA ────────────────────────────────────────────────────────────────────────

export const qaApi = {
  listImageReviews:  (p?: Record<string, string | number | undefined>) => get('/qa/image-reviews', p),
  createImageReview: (body: unknown) => post('/qa/image-reviews', body),
  listPeerReviews:   (p?: Record<string, string | number | undefined>) => get('/qa/peer-reviews', p),
  createPeerReview:  (body: unknown) => post('/qa/peer-reviews', body),
  patchPeerReview:   (id: string, body: unknown) => patch(`/qa/peer-reviews/${id}`, body),
}

// ── Dose Records ──────────────────────────────────────────────────────────────

export const doseApi = {
  list:    (p?: Record<string, string | number | undefined>) => get('/dose-records', p),
  get:     (id: string) => get(`/dose-records/${id}`),
  summary: () => get('/dose-records/summary'),
}

// ── Inventory ─────────────────────────────────────────────────────────────────

export const inventoryApi = {
  list:       (p?: Record<string, string | number | undefined>) => get('/inventory', p),
  get:        (id: string) => get(`/inventory/${id}`),
  patch:      (id: string, body: unknown) => patch(`/inventory/${id}`, body),
  receiveLot: (id: string, body: unknown) => post(`/inventory/${id}/receive-lot`, body),
  administer: (id: string, body: unknown) => post(`/inventory/${id}/administer`, body),
  dispose:    (id: string, body: unknown) => post(`/inventory/${id}/dispose`, body),
  listLots:   (p?: Record<string, string | number | undefined>) => get('/inventory/lots', p),
}

// ── Claims ────────────────────────────────────────────────────────────────────

export const claimsApi = {
  list:   (p?: Record<string, string | number | undefined>) => get('/claims', p),
  get:    (id: string) => get(`/claims/${id}`),
  create: (body: unknown) => post('/claims', body),
  patch:  (id: string, body: unknown) => patch(`/claims/${id}`, body),
  submit: (id: string) => post(`/claims/${id}/submit`, {}),
  appeal: (id: string, body: unknown) => post(`/claims/${id}/appeal`, body),
}

// ── Documents ─────────────────────────────────────────────────────────────────

export const documentsApi = {
  list: (p?: Record<string, string | number | undefined>) => get('/documents', p),
}

// ── Staff ─────────────────────────────────────────────────────────────────────

export const staffApi = {
  list:   (p?: Record<string, string | number | undefined>) => get('/staff', p),
  get:    (id: string) => get(`/staff/${id}`),
  create: (body: unknown) => post('/staff', body),
  patch:  (id: string, body: unknown) => patch(`/staff/${id}`, body),
}

// ── Locations ─────────────────────────────────────────────────────────────────

export const locationsApi = {
  list: (p?: Record<string, string | number | undefined>) => get('/locations', p),
}

// ── Procedures ────────────────────────────────────────────────────────────────

export const proceduresApi = {
  list: (p?: Record<string, string | number | undefined>) => get('/procedures', p),
}

// ── Protocols ─────────────────────────────────────────────────────────────────

export const protocolsApi = {
  list: (p?: Record<string, string | number | undefined>) => get('/protocols', p),
}

// ── Settings ──────────────────────────────────────────────────────────────────

export const settingsApi = {
  getPacs:      () => get('/settings/pacs'),
  createPacs:   (body: unknown) => post('/settings/pacs', body),
  patchPacs:    (id: string, body: unknown) => patch(`/settings/pacs/${id}`, body),
  getProtocols: () => get('/settings/protocols'),
  postProtocol: (body: unknown) => post('/settings/protocols', body),
}
