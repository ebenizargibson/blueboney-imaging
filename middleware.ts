import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const token = req.cookies.get('imaging_portal_token')?.value
  if (!token) {
    const login = new URL('/login', req.url)
    login.searchParams.set('next', req.nextUrl.pathname)
    return NextResponse.redirect(login)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/portal/:path*'],
}
