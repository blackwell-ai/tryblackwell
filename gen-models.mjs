// Generates on-model editorial shots per gender via the OpenAI image API.
// Reads OPENAI_API_KEY from the environment. Output: public/shop/<handle>-model-<gender>.png
// Usage: node gen-models.mjs            -> all, skip existing
//        node gen-models.mjs --force    -> regenerate everything
//        node gen-models.mjs hoodie     -> one handle
import { mkdir, writeFile, stat } from "node:fs/promises"
import path from "node:path"

const KEY = process.env.OPENAI_API_KEY
if (!KEY) { console.error("Missing OPENAI_API_KEY"); process.exit(1) }

const STYLE =
  "Dark studio, dramatic rim and edge lighting that clearly separates the black garment " +
  "from a graduated charcoal-to-near-black background, the garment legible with visible " +
  "fabric texture and fit. Moody, premium, minimalist, high-fashion meets Teenage " +
  "Engineering. Three-quarter to full body, photorealistic, ultra sharp, high detail. " +
  "No text, no logos, no props."

const PERSON = { men: "a male model", women: "a female model", unisex: "a model" }

// [handle, what they're wearing, genders]
const ITEMS = [
  ["tee", "a fitted premium black t-shirt", ["men", "women"]],
  ["tank-top", "a fitted black athletic tank top", ["men", "women"]],
  ["compression-short-sleeve", "a tight black short-sleeve compression athletic top", ["men", "women"]],
  ["compression-long-sleeve", "a tight black long-sleeve compression athletic top", ["men", "women"]],
  ["polo", "a slim-fit black short-sleeve polo shirt", ["men", "women"]],
  ["long-sleeve-polo", "a slim-fit black long-sleeve polo shirt", ["men", "women"]],
  ["shirt", "a tailored black button-up shirt", ["men", "women"]],
  ["hoodie", "a premium black pullover hoodie", ["men", "women"]],
  ["sweater", "a fitted black knit crewneck sweater", ["men", "women"]],
  ["pant", "baggy black technical-nylon dress trousers and a plain black top", ["men", "women"]],
  ["denim", "baggy black denim jeans with cargo pockets and a plain black top", ["men", "women"]],
  ["cap", "a structured black baseball cap and a plain black outfit", ["unisex"]],
]

const args = process.argv.slice(2)
const force = args.includes("--force")
const onlyHandle = args.find((a) => !a.startsWith("--"))
const targets = onlyHandle ? ITEMS.filter(([h]) => h === onlyHandle) : ITEMS
const outDir = path.join(process.cwd(), "public", "shop")
await mkdir(outDir, { recursive: true })

for (const [handle, subject, genders] of targets) {
  for (const g of genders) {
    const outPath = path.join(outDir, `${handle}-model-${g}.png`)
    if (!force && !onlyHandle) {
      try { await stat(outPath); console.log(`${handle} ${g} exists, skipping`); continue } catch {}
    }
    const prompt = `Editorial fashion photograph of ${PERSON[g]} wearing ${subject}. ${STYLE}`
    process.stdout.write(`generating ${handle} model ${g} ... `)
    try {
      const res = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "gpt-image-1", prompt, size: "1024x1536", quality: "high", n: 1 }),
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
