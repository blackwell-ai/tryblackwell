import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createSupabaseServerClient } from "@/app/lib/supabase/server"

/**
 * LOCAL-ONLY role preview. Magic-link login needs the Supabase Auth URL config
 * + email wired up; until then this lets you drop into any role's console
 * without that round-trip. It mints a session for a throwaway demo account using
 * the service-role key (server-only) — never reachable in production.
 *
 *   /auth/dev?role=reviewer | brand | admin
 */
const DEMO = {
  reviewer: "demo-reviewer@blackwell.test",
  brand: "demo-brand@blackwell.test",
  admin: "demo-admin@blackwell.test",
} as const

// Throwaway password, only ever used locally with the service-role key.
const DEV_PASSWORD = "blackwell-dev-preview-2026"

export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not found", { status: 404 })
  }

  const { searchParams, origin } = new URL(request.url)
  const role = searchParams.get("role")
  if (!role || !(role in DEMO)) {
    return NextResponse.redirect(`${origin}/login`)
  }
  const email = DEMO[role as keyof typeof DEMO]

  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    return new NextResponse(
      "Dev preview needs SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local",
      { status: 500 }
    )
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } })

  // Ensure the demo reviewer/brand/match (and demo-admin allowlist) exist.
  await admin.rpc("seed_demo_marketplace")

  // Ensure the demo auth user exists, is confirmed, and has the dev password.
  const created = await admin.auth.admin.createUser({
    email,
    password: DEV_PASSWORD,
    email_confirm: true,
  })
  if (created.error) {
    // Already registered: find them and (re)set password + confirm.
    const { data: list } = await admin.auth.admin.listUsers({ perPage: 200 })
    const existing = list?.users.find((u) => u.email?.toLowerCase() === email)
    if (existing) {
      await admin.auth.admin.updateUserById(existing.id, {
        password: DEV_PASSWORD,
        email_confirm: true,
      })
    }
  }

  // Establish the cookie session via the SSR server client.
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password: DEV_PASSWORD })
  if (error) {
    return NextResponse.redirect(`${origin}/login?error=dev`)
  }
  return NextResponse.redirect(`${origin}/dashboard`)
}
