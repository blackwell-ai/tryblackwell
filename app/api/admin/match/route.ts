import { NextResponse } from "next/server"
import { getWho } from "@/app/lib/portal"
import { aiConfigured } from "@/app/lib/ai/anthropic"
import { rankMatches } from "@/app/lib/ai/match"

type TagRow = { label?: string }
type Candidate = {
  reviewer_id: string
  name: string
  product_interests: string | null
  tags: TagRow[]
  shared_tag_count: number
}

/** Admin: AI-rank reviewer candidates for a brand. Candidates are pre-filtered
 *  by tag overlap (admin_match_candidates), then the model scores + explains. */
export async function POST(req: Request) {
  if (!aiConfigured()) {
    return NextResponse.json({ error: "AI is not configured" }, { status: 503 })
  }
  const { supabase, user, who } = await getWho()
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  if (!who?.is_admin) return NextResponse.json({ error: "forbidden" }, { status: 403 })

  const body = (await req.json().catch(() => ({}))) as { brandId?: string }
  const brandId = typeof body.brandId === "string" ? body.brandId : null
  if (!brandId) return NextResponse.json({ error: "brandId required" }, { status: 400 })

  // Admin-gated RPC via the caller's session.
  const { data, error } = await supabase.rpc("admin_match_candidates", {
    p_brand_id: brandId,
    p_lim: 25,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const payload = data as {
    brand: { brand_name: string; category: string | null; product_description: string | null; tags: TagRow[] } | null
    candidates: Candidate[]
  } | null
  if (!payload?.brand) return NextResponse.json({ error: "brand not found" }, { status: 404 })

  const candidates = (payload.candidates ?? []).map((c) => ({
    reviewer_id: c.reviewer_id,
    name: c.name,
    product_interests: c.product_interests,
    tags: (c.tags ?? []).map((t) => t.label ?? "").filter(Boolean),
    shared_tag_count: c.shared_tag_count,
  }))

  if (candidates.length === 0) {
    return NextResponse.json({ matches: [], note: "No tag-overlap candidates — synthesize tags first." })
  }

  try {
    const ranked = await rankMatches({
      brand: {
        brand_name: payload.brand.brand_name,
        category: payload.brand.category,
        product_description: payload.brand.product_description,
        tags: (payload.brand.tags ?? []).map((t) => t.label ?? "").filter(Boolean),
      },
      candidates,
    })
    const nameById = new Map(candidates.map((c) => [c.reviewer_id, c.name]))
    const matches = ranked.map((m) => ({ ...m, name: nameById.get(m.reviewer_id) ?? "Reviewer" }))
    return NextResponse.json({ matches })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
