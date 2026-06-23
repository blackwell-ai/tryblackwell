import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

/**
 * Next.js 16 routing middleware (proxy). Refreshes the Supabase session cookie
 * on every request and gate-keeps the reviewer portal. Keep getUser() here so
 * expired tokens are rotated before Server Components read them.
 */
export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value)
          }
          response = NextResponse.next({ request })
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options)
          }
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Auth gate for every signed-in surface. Role-level authorization (admin vs
  // brand vs reviewer) is enforced in each page + the SECURITY DEFINER RPCs;
  // here we only require *a* session. Match exact segments so the marketing
  // route /brands is NOT caught by the /brand gate.
  const gated = ["/portal", "/brand", "/admin", "/dashboard"]
  const isGated = gated.some((p) => path === p || path.startsWith(p + "/"))
  if (!user && isGated) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    // Everything except Next internals and static assets.
    "/((?!_next/static|_next/image|favicon.ico|icon|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
