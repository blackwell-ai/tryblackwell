"use client"

import { useEffect, useState } from "react"
import { createSupabaseBrowserClient } from "@/app/lib/supabase/browser"

export type Tag = { id: string; label: string; kind?: string; source?: string }

type Supa = ReturnType<typeof createSupabaseBrowserClient>

const chipCls =
  "inline-flex items-center gap-1.5 rounded-full border border-[#f8f8f8]/20 px-3 py-1 text-xs text-[#f8f8f8]/80"
const inputCls =
  "w-full rounded-md border border-[#f8f8f8]/20 bg-transparent px-3 py-1.5 text-sm outline-none placeholder:text-[#f8f8f8]/25 focus:border-[#f8f8f8]/50"

/** Read-only tag chips. */
export function TagChips({ tags, empty }: { tags: Tag[]; empty?: string }) {
  if (!tags?.length) {
    return empty ? <span className="text-xs text-[#f8f8f8]/35">{empty}</span> : null
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((t) => (
        <span
          key={t.id}
          className="rounded border border-[#f8f8f8]/15 px-1.5 py-0.5 text-[11px] text-[#f8f8f8]/60"
        >
          {t.label}
        </span>
      ))}
    </div>
  )
}

/** Shared add/remove editor. The caller supplies the RPC wiring. */
function TagEditorBase({
  tags,
  onChange,
  add,
  remove,
  vocab,
  placeholder = "Add a tag or category…",
}: {
  tags: Tag[]
  onChange: (tags: Tag[]) => void
  add: (label: string) => Promise<Tag[] | null>
  remove: (tagId: string) => Promise<Tag[] | null>
  vocab: string[]
  placeholder?: string
}) {
  const [input, setInput] = useState("")
  const [busy, setBusy] = useState(false)

  async function onAdd(e: React.FormEvent) {
    e.preventDefault()
    const label = input.trim()
    if (!label) return
    setBusy(true)
    const next = await add(label)
    setBusy(false)
    if (next) {
      onChange(next)
      setInput("")
    }
  }

  async function onRemove(id: string) {
    const prev = tags
    onChange(tags.filter((t) => t.id !== id))
    const next = await remove(id)
    if (next) onChange(next)
    else onChange(prev)
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {tags.map((t) => (
          <span key={t.id} className={chipCls}>
            {t.label}
            <button
              type="button"
              onClick={() => onRemove(t.id)}
              className="text-[#f8f8f8]/40 hover:text-[#f8f8f8]"
              aria-label={`Remove ${t.label}`}
            >
              ✕
            </button>
          </span>
        ))}
        {tags.length === 0 && <span className="text-sm text-[#f8f8f8]/40">No tags yet.</span>}
      </div>
      <form onSubmit={onAdd} className="mt-3 flex max-w-sm gap-2">
        <input
          list="tag-vocab"
          className={inputCls}
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <datalist id="tag-vocab">
          {vocab.map((v) => (
            <option key={v} value={v} />
          ))}
        </datalist>
        <button
          type="submit"
          disabled={busy}
          className="shrink-0 rounded-md border border-[#f8f8f8]/25 px-3 py-1.5 text-sm hover:bg-[#f8f8f8]/5 disabled:opacity-50"
        >
          Add
        </button>
      </form>
    </div>
  )
}

function useVocabulary(supabase: Supa) {
  const [vocab, setVocab] = useState<string[]>([])
  useEffect(() => {
    let active = true
    supabase.rpc("list_tags", { p_search: "", p_lim: 80 }).then(({ data }) => {
      if (active && Array.isArray(data)) setVocab((data as Tag[]).map((t) => t.label))
    })
    return () => {
      active = false
    }
  }, [supabase])
  return vocab
}

/** Self-service editor for the signed-in reviewer/brand. */
export function SelfTagEditor({ tags, onChange }: { tags: Tag[]; onChange: (t: Tag[]) => void }) {
  const [supabase] = useState(() => createSupabaseBrowserClient())
  const vocab = useVocabulary(supabase)
  return (
    <TagEditorBase
      tags={tags}
      onChange={onChange}
      vocab={vocab}
      add={async (label) => {
        const { data, error } = await supabase.rpc("add_my_tag", { p_label: label })
        return error ? null : ((data as Tag[]) ?? [])
      }}
      remove={async (id) => {
        const { data, error } = await supabase.rpc("remove_my_tag", { p_tag_id: id })
        return error ? null : ((data as Tag[]) ?? [])
      }}
    />
  )
}

/** Admin editor for a specific reviewer/brand, with AI re-synthesis. */
export function AdminEntityTags({
  kind,
  id,
  initialTags,
}: {
  kind: "reviewer" | "brand"
  id: string
  initialTags: Tag[]
}) {
  const [supabase] = useState(() => createSupabaseBrowserClient())
  const [tags, setTags] = useState<Tag[]>(initialTags)
  const [synth, setSynth] = useState<"idle" | "running" | "error">("idle")
  const vocab = useVocabulary(supabase)

  async function synthesize() {
    setSynth("running")
    const res = await fetch("/api/admin/tags/synthesize", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind, id }),
    })
    if (!res.ok) {
      setSynth("error")
      return
    }
    const { data } = await supabase.rpc("admin_get_entity_tags", { p_kind: kind, p_id: id })
    if (Array.isArray(data)) setTags(data as Tag[])
    setSynth("idle")
  }

  return (
    <div>
      <TagEditorBase
        tags={tags}
        onChange={setTags}
        vocab={vocab}
        add={async (label) => {
          const { data, error } = await supabase.rpc("admin_add_entity_tag", {
            p_kind: kind,
            p_id: id,
            p_label: label,
          })
          return error ? null : ((data as Tag[]) ?? [])
        }}
        remove={async (tagId) => {
          const { data, error } = await supabase.rpc("admin_remove_entity_tag", {
            p_kind: kind,
            p_id: id,
            p_tag_id: tagId,
          })
          return error ? null : ((data as Tag[]) ?? [])
        }}
      />
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={synthesize}
          disabled={synth === "running"}
          className="rounded-md border border-[#f8f8f8]/25 px-3 py-1.5 text-xs hover:bg-[#f8f8f8]/5 disabled:opacity-50"
        >
          {synth === "running" ? "Synthesizing…" : "✦ AI synthesize tags"}
        </button>
        {synth === "error" && <span className="text-xs text-red-400">AI failed (key set?)</span>}
      </div>
    </div>
  )
}
