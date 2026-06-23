import { NextResponse } from "next/server"
import { getWho } from "@/app/lib/portal"
import { aiConfigured } from "@/app/lib/ai/anthropic"
import { synthesizeEntityTags } from "@/app/lib/ai/run"

/**
 * Auto-synthesize tags for the SIGNED-IN user's own profile (reviewer or
 * brand). Called after they save their freeform interests/description. Scoped
 * to the caller's own entity via whoami — no id is accepted from the client.
 */
export async function POST() {
  if (!aiConfigured()) {
    return NextResponse.json({ error: "AI is not configured" }, { status: 503 })
  }
  const { user, who } = await getWho()
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  const kind: "reviewer" | "brand" | null = who?.reviewer_id
    ? "reviewer"
    : who?.brand_id
      ? "brand"
      : null
  const id = who?.reviewer_id ?? who?.brand_id ?? null
  if (!kind || !id) return NextResponse.json({ error: "no profile to tag" }, { status: 400 })

  try {
    const tags = await synthesizeEntityTags(kind, id)
    return NextResponse.json({ tags })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
