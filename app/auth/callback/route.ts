import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/app/lib/supabase/server"

/**
 * Magic-link landing. Supabase redirects here with a `?code=` that we exchange
 * for a cookie session (the PKCE verifier was set by the browser client at
 * sign-in). On success the auth.users insert/confirm trigger has bound the
 * reviewer row; we then send them into the portal.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  // Land on the dispatcher, which routes to the right console by role.
  const next = searchParams.get("next") ?? "/dashboard"

  if (code) {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }
  return NextResponse.redirect(`${origin}/login?error=auth`)
}
