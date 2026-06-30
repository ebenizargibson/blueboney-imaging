export const COOKIE = 'imaging_portal_token'

export function getToken(): string {
  if (typeof window === 'undefined') return ''
  return (
    document.cookie
      .split('; ')
      .find(r => r.startsWith(`${COOKIE}=`))
      ?.split('=')[1] ?? ''
  )
}
