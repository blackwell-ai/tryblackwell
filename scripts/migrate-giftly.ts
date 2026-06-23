/**
 * One-way sync: Giftly (public.creators, public.brands) -> Blackwell
 * (marketplace.reviewers, marketplace.brands). Idempotent upsert on `id`, so
 * it is safe to re-run as Giftly keeps taking applications.
 *
 * Data streams directly between the two projects via two service-role clients;
 * it never round-trips through anything else. Reads use Giftly's secret key
 * (RLS blocks the anon key on creators/brands). Writes go through the
 * service_role-only SECURITY DEFINER RPCs public.import_marketplace_* because
 * the marketplace schema is intentionally not exposed to the Data API.
 *
 *   pnpm migrate:giftly        (or: npx tsx scripts/migrate-giftly.ts)
 *
 * Requires in .env.local:
 *   SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY   (Blackwell, destination)
 *   GIFTLY_SUPABASE_URL + GIFTLY_SECRET_KEY    (Giftly, source)
 */
import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

// tsx does not auto-load .env.local; parse it ourselves without clobbering
// anything already present in the real environment.
function loadEnvLocal() {
  try {
    const text = readFileSync(resolve(process.cwd(), ".env.local"), "utf8")
    for (const raw of text.split("\n")) {
      const line = raw.trim()
      if (!line || line.startsWith("#")) continue
      const eq = line.indexOf("=")
      if (eq === -1) continue
      const key = line.slice(0, eq).trim()
      let val = line.slice(eq + 1).trim()
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1)
      }
      if (!(key in process.env)) process.env[key] = val
    }
  } catch {
    /* no .env.local — fall back to the real environment */
  }
}
loadEnvLocal()

const GIFTLY_URL = process.env.GIFTLY_SUPABASE_URL
const GIFTLY_KEY = process.env.GIFTLY_SECRET_KEY
const BW_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
const BW_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!GIFTLY_URL || !GIFTLY_KEY) {
  console.error("Missing GIFTLY_SUPABASE_URL / GIFTLY_SECRET_KEY in .env.local")
  process.exit(1)
}
if (!BW_URL || !BW_KEY) {
  console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env.local")
  process.exit(1)
}

const giftly = createClient(GIFTLY_URL, GIFTLY_KEY, { auth: { persistSession: false } })
const bw = createClient(BW_URL, BW_KEY, { auth: { persistSession: false } })

// Only the columns the importer RPCs consume. Giftly's auth_user_id / owner_id /
// invited_at are deliberately omitted: those ids belong to Giftly's auth.users
// and are imported as NULL (reviewers get re-bound to Blackwell auth later).
// platform/followers intentionally dropped — reviewers aren't influencers, so
// those metrics are obsolete (see migration 20260622000007).
const REVIEWER_COLS =
  "id,name,email,social_handles,niches,product_interests,content_link,shipping_address,notes,source,reviewed_at,archived_at,created_at,updated_at"
const BRAND_COLS =
  "id,brand_name,website,category,product_description,contact_name,contact_role,contact_email,stage,source,notes,reviewed_at,archived_at,created_at,updated_at"

async function sync(srcTable: string, cols: string, rpc: string): Promise<number> {
  const PAGE = 1000
  let from = 0
  let total = 0
  for (;;) {
    const { data, error } = await giftly
      .from(srcTable)
      .select(cols)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true })
      .range(from, from + PAGE - 1)
    if (error) throw new Error(`read ${srcTable}: ${error.message}`)
    if (!data || data.length === 0) break

    const { data: affected, error: rpcErr } = await bw.rpc(rpc, { rows: data })
    if (rpcErr) throw new Error(`${rpc}: ${rpcErr.message}`)

    total += data.length
    console.log(`  ${srcTable}: +${data.length} (running ${total}, rpc upserted ${affected})`)
    if (data.length < PAGE) break
    from += PAGE
  }
  return total
}

async function main() {
  console.log("Syncing Giftly -> Blackwell marketplace ...")
  const reviewers = await sync("creators", REVIEWER_COLS, "import_marketplace_reviewers")
  const brands = await sync("brands", BRAND_COLS, "import_marketplace_brands")
  console.log(`\nDone: ${reviewers} reviewers, ${brands} brands synced.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
