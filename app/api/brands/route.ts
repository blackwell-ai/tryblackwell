import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const LEADS_TO = "founders@tryblackwell.com"

export async function POST(req: Request) {
  let body: { brandUrl?: string; email?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 })
  }

  const brandUrl = (body.brandUrl || "").trim()
  const email = (body.email || "").trim().toLowerCase() || null
  if (!brandUrl) {
    return NextResponse.json({ error: "Enter your store URL." }, { status: 400 })
  }

  // Capture the lead so nothing is lost, even before email is configured.
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (url && key) {
    const supa = createClient(url, key, { auth: { persistSession: false } })
    const { error } = await supa.from("brand_leads").insert({ brand_url: brandUrl, email })
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  // Notify us by email if a provider is configured.
  const resendKey = process.env.RESEND_API_KEY
  if (resendKey) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.LEADS_FROM || "Blackwell <onboarding@resend.dev>",
        to: [LEADS_TO],
        subject: `New brand audit request: ${brandUrl}`,
        text: `Store URL: ${brandUrl}\nContact email: ${email || "(none provided)"}`,
      }),
    }).catch(() => {})
  }

  return NextResponse.json({ ok: true })
}
