import { getAnthropic, AI_MODEL, readJsonBlock } from "./anthropic"

const TAG_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    tags: { type: "array", items: { type: "string" } },
  },
  required: ["tags"],
} as const

/**
 * Turn a freeform reviewer-interest / brand-description into a small set of
 * tags. Reuses the existing vocabulary when it fits and mints new tags only
 * when nothing captures an important concept — the taxonomy grows organically
 * and is never fuzzy-deduplicated (exact labels collapse in the DB).
 */
export async function synthesizeTags(opts: {
  kind: "reviewer" | "brand"
  text: string
  vocabulary: string[]
}): Promise<string[]> {
  const text = (opts.text ?? "").trim()
  if (!text) return []

  const subject =
    opts.kind === "reviewer"
      ? "a product reviewer describing the kinds of products they want to receive and review"
      : "a brand describing what it sells and the space it operates in"

  const system =
    "You tag profiles for a product-review matching marketplace. Output 3-8 short, lowercase tags capturing the product categories, niches, and attributes implied by the text. " +
    "Strongly prefer reusing tags from the provided vocabulary when they fit. Only invent a new tag when nothing in the vocabulary captures an important, specific concept. " +
    "Keep tags concise (1-3 words), concrete, and non-redundant — never output near-duplicates of each other or of vocabulary entries."

  const prompt =
    `This is ${subject}.\n\n` +
    `Existing tag vocabulary (reuse when appropriate):\n${opts.vocabulary.join(", ") || "(none yet)"}\n\n` +
    `Text:\n"""\n${text.slice(0, 4000)}\n"""\n\n` +
    `Return the tags.`

  const res = await getAnthropic().messages.create({
    model: AI_MODEL,
    max_tokens: 1024,
    system,
    output_config: { format: { type: "json_schema", schema: TAG_SCHEMA } },
    messages: [{ role: "user", content: prompt }],
  })

  const json = readJsonBlock(res)
  if (!json) return []
  let parsed: { tags?: unknown }
  try {
    parsed = JSON.parse(json)
  } catch {
    return []
  }
  const raw = Array.isArray(parsed.tags) ? parsed.tags : []
  const seen = new Set<string>()
  const out: string[] = []
  for (const t of raw) {
    if (typeof t !== "string") continue
    const label = t.trim().toLowerCase()
    if (!label || seen.has(label)) continue
    seen.add(label)
    out.push(label)
    if (out.length >= 10) break
  }
  return out
}
