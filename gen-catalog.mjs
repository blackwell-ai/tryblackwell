// Generates product renders for the catalog via the OpenAI image API.
// Reads OPENAI_API_KEY from the environment (never hardcoded).
// Usage: node gen-catalog.mjs                 -> all, both views, skip existing
//        node gen-catalog.mjs --force         -> regenerate everything
//        node gen-catalog.mjs hoodie front    -> one handle, one view (always regenerates)
//        node gen-catalog.mjs denim           -> one handle, both views
import { mkdir, writeFile, stat } from "node:fs/promises"
import path from "node:path"

const KEY = process.env.OPENAI_API_KEY
if (!KEY) { console.error("Missing OPENAI_API_KEY"); process.exit(1) }

// Lighting tuned so a black garment reads clearly against a dark ground.
const STYLE =
  "High-end studio product photograph. The garment is deep black but clearly legible: " +
  "lit with a soft key light plus strong rim and edge lighting that traces its silhouette " +
  "and separates it from the background, with visible highlights, sheen, seams, and fabric " +
  "texture. The background is a smooth graduated dark charcoal fading to near-black (never " +
  "pure black), with a soft pool of light behind the product so its shape reads clearly. " +
  "Invisible-mannequin (ghost) presentation, garment centered with generous negative space, " +
  "premium minimalist e-commerce, photorealistic, ultra sharp, high detail. No text, no " +
  "logos, no props, no human model."

const VIEWS = {
  front: "Front view of the garment.",
  back: "Rear view, clearly showing the back of the garment.",
}

const ITEMS = [
  ["tee", "a fitted premium heavyweight black t-shirt"],
  ["tank-top", "a fitted black athletic tank top"],
  ["compression-short-sleeve", "a tight black short-sleeve compression athletic base-layer top"],
  ["compression-long-sleeve", "a tight black long-sleeve compression athletic base-layer top"],
  ["polo", "a slim-fit black knit polo shirt"],
  ["shirt", "a tailored black button-up shirt"],
  ["hoodie", "a premium black pullover hoodie with a trim modern fit"],
  ["full-zip", "a black zip-up hooded sweatshirt with a hood and a single separating front zipper running cleanly from hem to collar, trim modern fit"],
  ["sweater", "a fitted fine-gauge black knit crewneck sweater"],
  ["pant", "a pair of baggy wide-leg dress trousers in black technical nylon, loose relaxed fit with a soft drape and slight sheen"],
  ["denim", "a pair of baggy wide-leg black denim jeans, loose relaxed fit, true black, with many utility pockets including large cargo pockets"],
  ["cap", "a structured black baseball cap"],
]

const args = process.argv.slice(2)
const force = args.includes("--force")
const flags = args.filter((a) => !a.startsWith("--"))
const onlyHandle = flags.find((a) => ITEMS.some(([h]) => h === a))
const onlyView = flags.find((a) => a === "front" || a === "back")

const targetItems = onlyHandle ? ITEMS.filter(([h]) => h === onlyHandle) : ITEMS
const targetViews = onlyView ? [onlyView] : ["front", "back"]
const outDir = path.join(process.cwd(), "public", "shop")
await mkdir(outDir, { recursive: true })

const fileFor = (handle, view) => path.join(outDir, view === "back" ? `${handle}-back.png` : `${handle}.png`)

for (const [handle, subject] of targetItems) {
  for (const view of targetViews) {
    const outPath = fileFor(handle, view)
    if (!force && !onlyHandle) {
      try { await stat(outPath); console.log(`${handle} ${view} exists, skipping`); continue } catch {}
    }
    process.stdout.write(`generating ${handle} ${view} ... `)
    try {
      const res = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-image-1",
          prompt: `${VIEWS[view]} ${subject}. ${STYLE}`,
          size: "1024x1024",
          quality: "high",
          n: 1,
        }),
      })
      const json = await res.json()
      if (!res.ok) { console.log("FAIL:", json.error?.message || res.status); continue }
      const b64 = json.data?.[0]?.b64_json
      if (!b64) { console.log("FAIL: no image returned"); continue }
      await writeFile(outPath, Buffer.from(b64, "base64"))
      console.log("ok")
    } catch (e) {
      console.log("ERROR:", String(e.message || e))
    }
  }
}
