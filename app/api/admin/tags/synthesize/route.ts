import { NextResponse } from "next/server"
import { getWho } from "@/app/lib/portal"
import { aiConfigured } from "@/app/lib/ai/anthropic"
import { synthesizeEntityTags } from "@/app/lib/ai/run"

/** Admin-triggered tag synthesis for any reviewer/brand. */
export async function POST(req: Request) {
  if (!aiConfigured()) {
    return NextResponse.json({ error: "AI is not configured" }, { status: 503 })
  }
  const { user, who } = await getWho()
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  if (!who?.is_admin) return NextResponse.json({ error: "forbidden" }, { status: 403 })

  const body = (await req.json().catch(() => ({}))) as { kind?: string; id?: string }
  const kind = body.kind === "brand" ? "brand" : body.kind === "reviewer" ? "reviewer" : null
  const id = typeof body.id === "string" ? body.id : null
  if (!kind || !id) return NextResponse.json({ error: "kind and id required" }, { status: 400 })

  try {
    const tags = await synthesizeEntityTags(kind, id)
    return NextResponse.json({ tags })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
