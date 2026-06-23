import Anthropic from "@anthropic-ai/sdk"

/** Default model for tag synthesis + matching. */
export const AI_MODEL = "claude-opus-4-8"

let _client: Anthropic | null = null

/** Lazily construct the Anthropic client (reads ANTHROPIC_API_KEY from env). */
export function getAnthropic(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set")
  }
  if (!_client) _client = new Anthropic()
  return _client
}

export function aiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY)
}

/**
 * Pull the JSON text block out of a structured-output response. With adaptive
 * thinking the response also carries thinking blocks; we want the final text.
 * Returns null on a safety refusal so callers can degrade gracefully.
 */
export function readJsonBlock(res: Anthropic.Message): string | null {
  if (res.stop_reason === "refusal") return null
  const block = res.content.find((b) => b.type === "text")
  return block && block.type === "text" ? block.text : null
}
