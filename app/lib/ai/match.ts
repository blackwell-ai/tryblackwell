import { getAnthropic, AI_MODEL, readJsonBlock } from "./anthropic"

export type RankedMatch = { reviewer_id: string; score: number; reason: string }

export type MatchBrand = {
  brand_name: string
  category?: string | null
  product_description?: string | null
  tags: string[]
}
export type MatchCandidate = {
  reviewer_id: string
  name: string
  product_interests?: string | null
  tags: string[]
  shared_tag_count: number
}

const MATCH_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    matches: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          reviewer_id: { type: "string" },
          score: { type: "integer" },
          reason: { type: "string" },
        },
        required: ["reviewer_id", "score", "reason"],
      },
    },
  },
  required: ["matches"],
} as const

/**
 * Rank candidate reviewers for a brand. Candidates are pre-filtered by tag
 * overlap (admin_match_candidates); the model scores fit 0-100 and explains
 * each in a sentence, considering products vs. interests/tags beyond raw overlap.
 */
export async function rankMatches(opts: {
  brand: MatchBrand
  candidates: MatchCandidate[]
}): Promise<RankedMatch[]> {
  const { brand, candidates } = opts
  if (!candidates.length) return []

  const validIds = new Set(candidates.map((c) => c.reviewer_id))

  const system =
    "You match product reviewers to a brand for a gifting-and-review marketplace. For each candidate, score fit 0-100 from how well the brand's products align with the reviewer's interests and tags (shared-tag count is a hint, not the whole story). " +
    "Give a single concise sentence explaining the fit. Only return candidates that are a reasonable fit (score >= 40), sorted by score descending. Use the reviewer_id exactly as provided."

  const brandBlock =
    `Brand: ${brand.brand_name}\n` +
    `Category: ${brand.category ?? "-"}\n` +
    `Products: ${(brand.product_description ?? "-").slice(0, 1500)}\n` +
    `Brand tags: ${brand.tags.join(", ") || "-"}`

  const candBlock = candidates
    .map(
      (c) =>
        `[${c.reviewer_id}] ${c.name} — interests: ${(c.product_interests ?? "-").slice(0, 400)} — tags: ${
          c.tags.join(", ") || "-"
        } — shared tags: ${c.shared_tag_count}`,
    )
    .join("\n")

  const prompt = `${brandBlock}\n\nCandidate reviewers:\n${candBlock}\n\nReturn the best matches.`

  const res = await getAnthropic().messages.create({
    model: AI_MODEL,
    max_tokens: 8192,
    thinking: { type: "adaptive" },
    system,
    output_config: { format: { type: "json_schema", schema: MATCH_SCHEMA } },
    messages: [{ role: "user", content: prompt }],
  })

  const json = readJsonBlock(res)
  if (!json) return []
  let parsed: { matches?: unknown }
  try {
    parsed = JSON.parse(json)
  } catch {
    return []
  }
  const raw = Array.isArray(parsed.matches) ? parsed.matches : []
  const out: RankedMatch[] = []
  for (const m of raw) {
    if (!m || typeof m !== "object") continue
    const rec = m as Record<string, unknown>
    const reviewer_id = typeof rec.reviewer_id === "string" ? rec.reviewer_id : ""
    if (!validIds.has(reviewer_id)) continue
    const score = typeof rec.score === "number" ? Math.max(0, Math.min(100, Math.round(rec.score))) : 0
    const reason = typeof rec.reason === "string" ? rec.reason : ""
    out.push({ reviewer_id, score, reason })
  }
  out.sort((a, b) => b.score - a.score)
  return out
}
