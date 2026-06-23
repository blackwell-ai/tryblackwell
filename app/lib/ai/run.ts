import { createSupabaseAdminClient } from "@/app/lib/supabase/admin"
import { synthesizeTags } from "./synthesize"

/**
 * Synthesize and persist an entity's AI tags. Reads the freeform text +
 * vocabulary and writes the result through service-role RPCs (the marketplace
 * schema isn't reachable via supabase-js directly). Returns the applied labels.
 */
export async function synthesizeEntityTags(
  kind: "reviewer" | "brand",
  id: string,
): Promise<string[]> {
  const admin = createSupabaseAdminClient()

  const { data, error } = await admin.rpc("ai_synthesis_input", { p_kind: kind, p_id: id })
  if (error) throw new Error(error.message)

  const input = (data as { text?: string; vocabulary?: string[] } | null) ?? {}
  const text = (input.text ?? "").trim()
  if (!text) return [] // nothing to tag — leave existing tags alone

  const vocabulary = Array.isArray(input.vocabulary) ? input.vocabulary : []
  const labels = await synthesizeTags({ kind, text, vocabulary })

  // Applying (even an empty list) refreshes the entity's AI-sourced tags while
  // leaving self/admin tags intact.
  const { error: applyErr } = await admin.rpc("apply_ai_tags", {
    p_kind: kind,
    p_id: id,
    p_labels: labels,
  })
  if (applyErr) throw new Error(applyErr.message)

  return labels
}
