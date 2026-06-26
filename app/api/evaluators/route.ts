import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  let body: { name?: string; email?: string; products?: string; address?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 })
  }

  const name = (body.name || "").trim() || null
  const email = (body.email || "").trim().toLowerCase()
  const products = (body.products || "").trim() || null
  const address = (body.address || "").trim() || null

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 })
  }

  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    return NextResponse.json({ error: "Server not configured." }, { status: 500 })
  }

  const supa = createClient(url, key, { auth: { persistSession: false } })
  const { error } = await supa
    .from("evaluators")
    .upsert({ name, email, products, address }, { onConflict: "email" })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
