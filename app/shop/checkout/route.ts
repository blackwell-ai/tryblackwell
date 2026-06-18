import { NextRequest, NextResponse } from "next/server"
import { products } from "../products"

// Real Stripe Checkout, no SDK. Inert until STRIPE_KEY is set in the env.
export async function POST(req: NextRequest) {
  const key = process.env.STRIPE_KEY
  if (!key) {
    return NextResponse.json({ error: "Checkout is not connected yet." }, { status: 503 })
  }

  const { handle, size } = await req.json()
  const product = products.find((p) => p.handle === handle)
  if (!product || !product.price) {
    return NextResponse.json({ error: "This piece is not for sale yet." }, { status: 400 })
  }

  const params = new URLSearchParams({
    mode: "payment",
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": String(Math.round(product.price * 100)),
    "line_items[0][price_data][product_data][name]": size ? `${product.name} / ${size}` : product.name,
    "shipping_address_collection[allowed_countries][0]": "US",
    success_url: `${req.nextUrl.origin}/shop?status=success`,
    cancel_url: `${req.nextUrl.origin}/shop/${handle}`,
  })

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  })
  const session = await res.json()
  if (!res.ok) {
    return NextResponse.json({ error: session.error?.message || "Stripe error" }, { status: 500 })
  }
  return NextResponse.json({ url: session.url })
}
