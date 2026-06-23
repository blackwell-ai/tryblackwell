import { createClient } from "@supabase/supabase-js"

/**
 * Service-role Supabase client — SERVER ONLY. Bypasses RLS and can call the
 * service-role-only marketplace RPCs (e.g. apply_ai_tags). Never import this
 * into a Client Component or ship the key to the browser.
 */
export function createSupabaseAdminClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set")
  }
  return createClient(url, key, { auth: { persistSession: false } })
}
