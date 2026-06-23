import { createSupabaseServerClient } from "@/app/lib/supabase/server"

/**
 * Shared role plumbing for the marketplace consoles. The marketplace schema is
 * service-role-only, so every read here goes through a public SECURITY DEFINER
 * RPC (whoami / claim_* / *_matches). whoami() also lazily binds the signed-in
 * email to its reviewer/brand row, so calling it is what "activates" an account.
 */

export type Role = "admin" | "brand" | "reviewer" | "none" | "anon"

export type Who = {
  role: Role
  email: string | null
  is_admin: boolean
  reviewer_id: string | null
  brand_id: string | null
}

/** Where a given role belongs. Reviewers and brand-new users share /portal. */
export function homeForRole(role: Role | undefined): string {
  switch (role) {
    case "admin":
      return "/admin"
    case "brand":
      return "/brand"
    default:
      return "/portal"
  }
}

/**
 * Resolve the current session's role. Returns user: null when nobody is signed
 * in (callers redirect to /login). Otherwise returns the whoami() result.
 */
export async function getWho() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null, who: null as Who | null }
  const { data } = await supabase.rpc("whoami")
  return { supabase, user, who: (data as Who | null) ?? null }
}
