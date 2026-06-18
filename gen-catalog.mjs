// Generates spotlit-on-black product renders for the catalog via the OpenAI
// image API. Reads OPENAI_API_KEY from the environment (never hardcoded).
// Skips handles that already have a PNG unless --force is passed.
// Usage: node gen-catalog.mjs            -> all missing
//        node gen-catalog.mjs hoodie     -> just one handle
//        node gen-catalog.mjs --force    -> regenerate everything
import { mkdir, writeFile, stat } from "node:fs/promises"
import path from "node:path"

const KEY = process.env.OPENAI_API_KEY
if (!KEY) { console.error("Missing OPENAI_API_KEY"); process.exit(1) }

const STYLE =
  "Studio product photograph on a pure matte black seamless background, a single hard " +
  "top-down spotlight forming a soft pool of light that falls off into deep shadow, the " +
  "garment in true jet black with subtle fabric sheen and visible texture, suspended " +
  "invisible-mannequin presentation, centered with generous negative space, premium " +
  "minimalist e-commerce in the Teenage Engineering product aesthetic, photorealistic, " +
  "ultra sharp, high detail, no text, no logos, no props, no human model."

const ITEMS = [
  ["tee", "a fitted premium heavyweight black t-shirt"],
  ["tank-top", "a fitted black athletic tank top"],
  ["compression-short-sleeve", "a tight black short-sleeve compression athletic base-layer top"],
  ["compression-long-sleeve", "a tight black long-sleeve compression athletic base-layer top"],
  ["polo", "a slim-fit black knit polo shirt"],
  ["shirt", "a tailored black button-up shirt"],
  ["hoodie", "a premium black pullover hoodie with a trim modern fit"],
  ["full-zip", "a slim-fit black full-zip hooded jacket"],
  ["sweater", "a fitted fine-gauge black knit crewneck sweater"],
  ["pant", "a pair of relaxed black casual trousers"],
  ["denim", "a pair of slim true-black denim jeans"],
  ["cap", "a structured black baseball cap"],
]

const args = process.argv.slice(2)
const force = args.includes("--force")
const only = args.find((a) => !a.startsWith("--"))
const targets = only ? ITEMS.filter(([h]) => h === only) : ITEMS
const outDir = path.join(process.cwd(), "public", "shop")
await mkdir(outDir, { recursive: true })

for (const [handle, subject] of targets) {
  const outPath = path.join(outDir, `${handle}.png`)
  if (!force) {
    try { await stat(outPath); console.log(`${handle} exists, skipping`); continue } catch {}
  }
  process.stdout.write(`generating ${handle} ... `)
  try {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: `${subject}. ${STYLE}`,
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
