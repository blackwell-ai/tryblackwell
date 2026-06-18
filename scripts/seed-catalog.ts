/**
 * Seed the catalog into Supabase from the single source of truth:
 * app/shop/products.ts. Idempotent — safe to re-run.
 *
 * Loads: 12 products, their images, 127 variants (product x fit x size), and one
 * empty inventory row per variant. Prices are left NULL (the pricing teammate
 * fills them in). No costs, customers, orders, or finance rows are seeded.
 *
 * Run with the SERVICE ROLE key (bypasses RLS). Never ship this key to the browser.
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... pnpm seed
 *   (or: npx tsx scripts/seed-catalog.ts)
 */
import { createClient } from "@supabase/supabase-js"
import { products } from "../app/shop/products"

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error(
    "Missing env. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running."
  )
  process.exit(1)
}

const db = createClient(url, serviceKey, { auth: { persistSession: false } })

// products.ts encodes category only in source comments; map it explicitly.
const CATEGORY: Record<string, "tops" | "layers" | "bottoms" | "accessory"> = {
  "tee": "tops",
  "tank-top": "tops",
  "compression-short-sleeve": "tops",
  "compression-long-sleeve": "tops",
  "polo": "tops",
  "long-sleeve-polo": "tops",
  "shirt": "tops",
  "hoodie": "layers",
  "sweater": "layers",
  "pant": "bottoms",
  "denim": "bottoms",
  "cap": "accessory",
}

// Optional human-readable copy, lifted from gen-catalog.mjs subjects.
const DESCRIPTION: Record<string, string> = {
  "tee": "A fitted premium heavyweight black t-shirt.",
  "tank-top": "A fitted black athletic tank top.",
  "compression-short-sleeve": "A tight black short-sleeve compression base-layer top.",
  "compression-long-sleeve": "A tight black long-sleeve compression base-layer top.",
  "polo": "A slim-fit black short-sleeve knit polo shirt.",
  "long-sleeve-polo": "A slim-fit black long-sleeve knit polo shirt.",
  "shirt": "A tailored black button-up shirt.",
  "hoodie": "A premium black pullover hoodie with a trim modern fit.",
  "sweater": "A black knit crewneck sweater with a relaxed, oversized fit.",
  "pant": "Baggy wide-leg trousers in smooth black with a subtle sheen.",
  "denim": "Baggy wide-leg black denim with utility cargo pockets.",
  "cap": "A structured black baseball cap.",
}

// Fit -> 3-letter SKU code.
const FIT3: Record<string, string> = { Men: "MEN", Women: "WMN", Unisex: "UNI" }

const skuFor = (handle: string, fit: string, size: string) =>
  `BW-${handle.toUpperCase().replace(/-/g, "")}-${FIT3[fit] ?? fit.toUpperCase()}-${String(
    size
  ).toUpperCase()}`

async function main() {
  let totalVariants = 0

  for (let i = 0; i < products.length; i++) {
    const p = products[i]
    const category = CATEGORY[p.handle]
    if (!category) throw new Error(`No category mapped for handle "${p.handle}"`)

    // 1) product (upsert by handle)
    const { data: prod, error: prodErr } = await db
      .from("products")
      .upsert(
        {
          handle: p.handle,
          name: p.name,
          category,
          description: DESCRIPTION[p.handle] ?? null,
          status: "active",
          position: i,
        },
        { onConflict: "handle" }
      )
      .select("id")
      .single()
    if (prodErr) throw prodErr
    const productId = prod.id

    // 2) images — rebuild from scratch so re-runs stay clean
    await db.from("product_images").delete().eq("product_id", productId)
    const images: Record<string, unknown>[] = []
    if (p.image) images.push({ product_id: productId, kind: "front", url: p.image, position: 0 })
    if (p.back) images.push({ product_id: productId, kind: "back", url: p.back, position: 1 })
    if (p.model) {
      let pos = 2
      for (const [fit, url] of Object.entries(p.model)) {
        images.push({ product_id: productId, kind: "model", fit, url, position: pos++ })
      }
    }
    if (images.length) {
      const { error } = await db.from("product_images").insert(images)
      if (error) throw error
    }

    // 3) variants (upsert by sku) + 4) one inventory row per variant
    const fits = p.genders && p.genders.length ? p.genders : ["Unisex"]
    let vpos = 0
    for (const fit of fits) {
      for (const size of p.sizes) {
        const sku = skuFor(p.handle, fit, size)
        const { data: variant, error: vErr } = await db
          .from("variants")
          .upsert(
            {
              product_id: productId,
              sku,
              fit,
              size,
              price_amount: null, // pricing teammate fills this in
              currency: "usd",
              status: "active",
              position: vpos++,
            },
            { onConflict: "sku" }
          )
          .select("id")
          .single()
        if (vErr) throw vErr

        const { error: invErr } = await db
          .from("inventory")
          .upsert({ variant_id: variant.id }, { onConflict: "variant_id" })
        if (invErr) throw invErr

        totalVariants++
      }
    }
    console.log(`seeded ${p.handle.padEnd(26)} ${fits.length * p.sizes.length} variants`)
  }

  console.log(`\nDone: ${products.length} products, ${totalVariants} variants.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
