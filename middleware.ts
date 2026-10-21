import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server.js'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return supabaseResponse
    }

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            if (request.cookies && typeof request.cookies.getAll === 'function') {
              return request.cookies.getAll()
            }
            const cookieHeader = request.headers?.get?.('cookie') || ''
            return cookieHeader.split('; ').filter(Boolean).map(c => {
              const [name, ...v] = c.split('=')
              return { name: name.trim(), value: v.join('=') }
            })
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => {
              if (request.cookies && typeof request.cookies.set === 'function') {
                request.cookies.set(name, value)
              }
            })
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    const pathname = request.nextUrl?.pathname || new URL(request.url).pathname
    if (!user && pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  } catch (err) {
    console.error("Middleware safe fallback:", err)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

export default middleware;
