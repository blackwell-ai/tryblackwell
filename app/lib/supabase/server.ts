import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

/**
 * Supabase client for Server Components, Route Handlers, and Server Actions.
 * Uses the anon key plus the request's auth cookies, so RPCs (e.g.
 * claim_reviewer) run with the logged-in reviewer's identity (auth.uid()).
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options)
            }
          } catch {
            // Called from a Server Component, where cookies are read-only. The
            // middleware refreshes the session cookie instead, so ignore this.
          }
        },
      },
    }
  )
}
