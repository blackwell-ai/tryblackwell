"use client"

import { useEffect, useRef, useState } from "react"
import { createSupabaseBrowserClient } from "@/app/lib/supabase/browser"
import { StatusPill } from "@/app/lib/ui"
import { AdminEntityTags, TagChips, type Tag } from "@/app/lib/tags"

export type AdminStats = {
  reviewers: number
  brands: number
  matches: number
  reviewers_bound: number
  brands_bound: number
}
export type AdminReviewer = {
  id: string
  name: string
  email: string
  niches: string[]
  social_handles: string | null
  content_link: string | null
  product_interests: string | null
  shipping_address: string | null
  source: string
  notes: string | null
  bound: boolean
  archived_at: string | null
  created_at: string
  match_count: number
  tags: Tag[]
}
export type AdminBrand = {
  id: string
  brand_name: string
  website: string | null
  category: string | null
  product_description: string | null
  contact_name: string | null
  contact_role: string | null
  contact_email: string
  stage: string
  source: string
  notes: string | null
  bound: boolean
  archived_at: string | null
  created_at: string
  match_count: number
  tags: Tag[]
}
export type AdminMatch = {
  id: string
  status: string
  notes: string | null
  created_at: string
  reviewer_id: string
  reviewer_name: string
  reviewer_email: string
  brand_id: string
  brand_name: string
}

const MATCH_STATUSES = [
  "suggested",
  "invited",
  "accepted",
  "declined",
  "shipped",
  "reviewed",
  "completed",
  "cancelled",
]

const inputCls =
  "w-full rounded-md border border-[#f8f8f8]/20 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-[#f8f8f8]/25 focus:border-[#f8f8f8]/50"
const btnCls =
  "rounded-md bg-[#f8f8f8] px-3 py-2 text-sm font-medium text-[#010101] transition-opacity hover:opacity-90 disabled:opacity-50"
const ghostBtnCls =
  "rounded-md border border-[#f8f8f8]/25 px-3 py-2 text-sm hover:bg-[#f8f8f8]/5"

export function AdminConsole({
  initialStats,
  initialReviewers,
  initialBrands,
  initialMatches,
}: {
  initialStats: AdminStats | null
  initialReviewers: AdminReviewer[]
  initialBrands: AdminBrand[]
  initialMatches: AdminMatch[]
}) {
  const [supabase] = useState(() => createSupabaseBrowserClient())
  const [tab, setTab] = useState<"reviewers" | "brands" | "matches">("matches")
  const [stats, setStats] = useState(initialStats)
  const [reviewers, setReviewers] = useState(initialReviewers)
  const [brands, setBrands] = useState(initialBrands)
  const [matches, setMatches] = useState(initialMatches)

  async function refreshStats() {
    const { data } = await supabase.rpc("admin_stats")
    if (data) setStats(data as AdminStats)
  }

  return (
    <div className="mt-8">
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <Stat label="Reviewers" value={stats.reviewers} sub={`${stats.reviewers_bound} active`} />
          <Stat label="Brands" value={stats.brands} sub={`${stats.brands_bound} active`} />
          <Stat label="Matches" value={stats.matches} />
          <Stat label="Reviewers live" value={stats.reviewers_bound} />
          <Stat label="Brands live" value={stats.brands_bound} />
        </div>
      )}

      <nav className="mt-8 flex gap-1 border-b border-[#161616] text-sm">
        {(["matches", "reviewers", "brands"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 px-4 py-2 capitalize ${
              tab === t
                ? "border-[#f8f8f8] text-[#f8f8f8]"
                : "border-transparent text-[#f8f8f8]/50 hover:text-[#f8f8f8]/80"
            }`}
          >
            {t}
          </button>
        ))}
      </nav>

      <div className="mt-6">
        {tab === "matches" && (
          <MatchesTab
            supabase={supabase}
            matches={matches}
            setMatches={setMatches}
            onChanged={refreshStats}
          />
        )}
        {tab === "reviewers" && (
          <ReviewersTab supabase={supabase} reviewers={reviewers} setReviewers={setReviewers} />
        )}
        {tab === "brands" && (
          <BrandsTab
            supabase={supabase}
            brands={brands}
            setBrands={setBrands}
            onChanged={refreshStats}
          />
        )}
      </div>
    </div>
  )
}

function Stat({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="rounded-lg border border-[#f8f8f8]/12 p-3">
      <div className="text-2xl font-medium tabular-nums">{value}</div>
      <div className="mt-0.5 text-[11px] uppercase tracking-wide text-[#f8f8f8]/40">{label}</div>
      {sub && <div className="text-[11px] text-[#f8f8f8]/30">{sub}</div>}
    </div>
  )
}

/* eslint-disable @typescript-eslint/no-explicit-any */
type Supa = ReturnType<typeof createSupabaseBrowserClient>

// ---------------------------------------------------------------------------
// Matches
// ---------------------------------------------------------------------------
function MatchesTab({
  supabase,
  matches,
  setMatches,
  onChanged,
}: {
  supabase: Supa
  matches: AdminMatch[]
  setMatches: (m: AdminMatch[]) => void
  onChanged: () => void
}) {
  const [reviewer, setReviewer] = useState<PickItem | null>(null)
  const [brand, setBrand] = useState<PickItem | null>(null)
  const [note, setNote] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  async function refresh() {
    const { data } = await supabase.rpc("admin_list_matches", {})
    setMatches((data as AdminMatch[]) ?? [])
  }

  async function createMatch(e: React.FormEvent) {
    e.preventDefault()
    if (!reviewer || !brand) return
    setBusy(true)
    setError("")
    const { error } = await supabase.rpc("admin_create_match", {
      p_reviewer_id: reviewer.id,
      p_brand_id: brand.id,
      p_notes: note,
    })
    setBusy(false)
    if (error) {
      setError(error.message)
      return
    }
    setReviewer(null)
    setBrand(null)
    setNote("")
    await refresh()
    onChanged()
  }

  async function setStatus(id: string, status: string) {
    setMatches(matches.map((m) => (m.id === id ? { ...m, status } : m)))
    await supabase.rpc("admin_update_match_status", { p_match_id: id, p_status: status })
  }

  async function remove(id: string) {
    setMatches(matches.filter((m) => m.id !== id))
    await supabase.rpc("admin_delete_match", { p_match_id: id })
    onChanged()
  }

  return (
    <div className="space-y-8">
      <form onSubmit={createMatch} className="rounded-lg border border-[#f8f8f8]/12 p-4">
        <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-[#f8f8f8]/50">
          Pair a reviewer with a brand
        </h3>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <EntityPicker
            label="Reviewer"
            kind="reviewer"
            supabase={supabase}
            selected={reviewer}
            onSelect={setReviewer}
          />
          <EntityPicker
            label="Brand"
            kind="brand"
            supabase={supabase}
            selected={brand}
            onSelect={setBrand}
          />
        </div>
        <input
          className={`${inputCls} mt-4`}
          placeholder="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <div className="mt-4 flex items-center gap-3">
          <button type="submit" disabled={!reviewer || !brand || busy} className={btnCls}>
            {busy ? "Creating…" : "Create match"}
          </button>
          {error && <span className="text-sm text-red-400">{error}</span>}
        </div>
      </form>

      <AiMatchPanel
        supabase={supabase}
        onCreated={async () => {
          await refresh()
          onChanged()
        }}
      />

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-[#f8f8f8]/50">
            All matches ({matches.length})
          </h3>
        </div>
        {matches.length === 0 ? (
          <p className="text-sm text-[#f8f8f8]/50">No matches yet.</p>
        ) : (
          <ul className="space-y-2">
            {matches.map((m) => (
              <li
                key={m.id}
                className="flex flex-col gap-3 rounded-lg border border-[#f8f8f8]/12 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm">
                    <span className="font-medium">{m.reviewer_name}</span>
                    <span className="px-2 text-[#f8f8f8]/30">→</span>
                    <span className="font-medium">{m.brand_name}</span>
                  </div>
                  <div className="truncate text-xs text-[#f8f8f8]/40">{m.reviewer_email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={m.status}
                    onChange={(e) => setStatus(m.id, e.target.value)}
                    className="rounded-md border border-[#f8f8f8]/20 bg-[#010101] px-2 py-1 text-xs"
                  >
                    {MATCH_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => remove(m.id)}
                    className="text-xs text-[#f8f8f8]/40 underline-offset-4 hover:text-red-400 hover:underline"
                  >
                    delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// AI match panel — Claude ranks reviewers for a chosen brand
// ---------------------------------------------------------------------------
type AiMatch = { reviewer_id: string; name: string; score: number; reason: string }

function AiMatchPanel({ supabase, onCreated }: { supabase: Supa; onCreated: () => void }) {
  const [brand, setBrand] = useState<PickItem | null>(null)
  const [status, setStatus] = useState<"idle" | "running" | "error">("idle")
  const [message, setMessage] = useState("")
  const [results, setResults] = useState<AiMatch[]>([])
  const [created, setCreated] = useState<Set<string>>(new Set())

  async function suggest() {
    if (!brand) return
    setStatus("running")
    setMessage("")
    setResults([])
    setCreated(new Set())
    try {
      const res = await fetch("/api/admin/match", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ brandId: brand.id }),
      })
      const json = await res.json()
      if (!res.ok) {
        setStatus("error")
        setMessage(json.error ?? "AI match failed")
        return
      }
      setResults(json.matches ?? [])
      setMessage(json.note ?? "")
      setStatus("idle")
    } catch (e) {
      setStatus("error")
      setMessage((e as Error).message)
    }
  }

  async function create(reviewerId: string) {
    if (!brand) return
    await supabase.rpc("admin_create_match", {
      p_reviewer_id: reviewerId,
      p_brand_id: brand.id,
      p_notes: "AI-suggested",
    })
    setCreated((s) => new Set(s).add(reviewerId))
    onCreated()
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        suggest()
      }}
      className="rounded-lg border border-[#f8f8f8]/12 p-4"
    >
      <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-[#f8f8f8]/50">
        ✦ AI match a brand
      </h3>
      <p className="mt-1 text-xs text-[#f8f8f8]/40">
        Claude ranks reviewers by fit using both sides&apos; tags and interests.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <EntityPicker
            label="Brand"
            kind="brand"
            supabase={supabase}
            selected={brand}
            onSelect={(b) => {
              setBrand(b)
              setResults([])
              setMessage("")
            }}
          />
        </div>
        <button type="submit" disabled={!brand || status === "running"} className={btnCls}>
          {status === "running" ? "Thinking…" : "Suggest matches"}
        </button>
      </div>
      {status === "error" && <p className="mt-3 text-sm text-red-400">{message}</p>}
      {status !== "error" && message && <p className="mt-3 text-xs text-[#f8f8f8]/50">{message}</p>}
      {results.length > 0 && (
        <ul className="mt-4 space-y-2">
          {results.map((m) => (
            <li
              key={m.reviewer_id}
              className="flex items-start justify-between gap-3 rounded-md border border-[#f8f8f8]/12 p-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{m.name}</span>
                  <span className="rounded-full border border-[#f8f8f8]/25 px-2 py-0.5 text-[11px] tabular-nums text-[#f8f8f8]/70">
                    {m.score}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#f8f8f8]/60">{m.reason}</p>
              </div>
              <button
                type="button"
                disabled={created.has(m.reviewer_id)}
                onClick={() => create(m.reviewer_id)}
                className="shrink-0 rounded-md border border-[#f8f8f8]/25 px-3 py-1.5 text-xs hover:bg-[#f8f8f8]/5 disabled:opacity-40"
              >
                {created.has(m.reviewer_id) ? "✓ added" : "Create match"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </form>
  )
}

// ---------------------------------------------------------------------------
// Entity picker (search-as-you-type select for reviewers / brands)
// ---------------------------------------------------------------------------
type PickItem = { id: string; label: string; sub?: string }

function EntityPicker({
  label,
  kind,
  supabase,
  selected,
  onSelect,
}: {
  label: string
  kind: "reviewer" | "brand"
  supabase: Supa
  selected: PickItem | null
  onSelect: (item: PickItem | null) => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<PickItem[]>([])
  const [loading, setLoading] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Close when clicking outside the control.
  useEffect(() => {
    if (!open) return
    function onDoc(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [open])

  // Fetch only while the menu is open; debounce on the query. Opening with an
  // empty query loads the first results so there's always something to pick.
  useEffect(() => {
    if (!open) return
    if (timer.current) clearTimeout(timer.current)
    setLoading(true)
    timer.current = setTimeout(async () => {
      const fn = kind === "reviewer" ? "admin_list_reviewers" : "admin_list_brands"
      const { data } = await supabase.rpc(fn, { search: query, lim: 8, off: 0 })
      const rows = (data as any[]) ?? []
      setResults(
        rows.map((r) =>
          kind === "reviewer"
            ? { id: r.id, label: r.name, sub: r.email }
            : { id: r.id, label: r.brand_name, sub: r.contact_email }
        )
      )
      setLoading(false)
    }, 220)
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [query, open, kind, supabase])

  return (
    <div className="relative" ref={boxRef}>
      <span className="text-xs uppercase tracking-wide text-[#f8f8f8]/40">{label}</span>

      {/* The control: click to toggle the menu. Not a <button> so the clear
          affordance can nest without invalid markup. */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            setOpen((o) => !o)
          }
        }}
        className={`${inputCls} mt-1 flex cursor-pointer items-center justify-between`}
      >
        <span className={`truncate ${selected ? "" : "text-[#f8f8f8]/25"}`}>
          {selected ? selected.label : `Select a ${kind}…`}
        </span>
        <span className="ml-2 flex shrink-0 items-center gap-2">
          {selected && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onSelect(null)
                setQuery("")
              }}
              className="text-[#f8f8f8]/40 hover:text-[#f8f8f8]"
              aria-label="Clear selection"
            >
              ✕
            </button>
          )}
          <span className="text-[#f8f8f8]/40">{open ? "▴" : "▾"}</span>
        </span>
      </div>

      {open && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-[#f8f8f8]/20 bg-[#0a0a0a] shadow-xl">
          <input
            autoFocus
            className="w-full border-b border-[#f8f8f8]/10 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-[#f8f8f8]/25"
            placeholder={`Search ${kind}s…`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <ul className="max-h-64 overflow-auto">
            {loading && <li className="px-3 py-2 text-xs text-[#f8f8f8]/40">Searching…</li>}
            {!loading && results.length === 0 && (
              <li className="px-3 py-2 text-xs text-[#f8f8f8]/40">No matches</li>
            )}
            {results.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(r)
                    setOpen(false)
                    setQuery("")
                  }}
                  className="flex w-full flex-col items-start px-3 py-2 text-left hover:bg-[#f8f8f8]/5"
                >
                  <span className="text-sm">{r.label}</span>
                  {r.sub && <span className="text-xs text-[#f8f8f8]/40">{r.sub}</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Reviewers
// ---------------------------------------------------------------------------
function ReviewersTab({
  supabase,
  reviewers,
  setReviewers,
}: {
  supabase: Supa
  reviewers: AdminReviewer[]
  setReviewers: (r: AdminReviewer[]) => void
}) {
  const [search, setSearch] = useState("")
  const [openTags, setOpenTags] = useState<string | null>(null)

  async function run(e?: React.FormEvent) {
    e?.preventDefault()
    const { data } = await supabase.rpc("admin_list_reviewers", { search, lim: 200, off: 0 })
    setReviewers((data as AdminReviewer[]) ?? [])
  }

  return (
    <div>
      <SearchBar value={search} onChange={setSearch} onSubmit={run} placeholder="Search name or email" />
      <p className="mt-3 text-xs text-[#f8f8f8]/40">{reviewers.length} shown</p>
      <ul className="mt-3 space-y-2">
        {reviewers.map((r) => (
          <li key={r.id} className="rounded-lg border border-[#f8f8f8]/12 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{r.name}</span>
                  {r.bound && <StatusPill status="active" />}
                  {r.match_count > 0 && (
                    <span className="text-xs text-[#f8f8f8]/40">{r.match_count} matches</span>
                  )}
                </div>
                <div className="truncate text-xs text-[#f8f8f8]/50">{r.email}</div>
              </div>
              <span className="shrink-0 text-xs text-[#f8f8f8]/30">{r.source}</span>
            </div>
            {r.niches?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {r.niches.map((n) => (
                  <span
                    key={n}
                    className="rounded border border-[#f8f8f8]/15 px-1.5 py-0.5 text-[11px] text-[#f8f8f8]/60"
                  >
                    {n}
                  </span>
                ))}
              </div>
            )}
            {r.notes && <p className="mt-2 text-xs text-[#f8f8f8]/50">Note: {r.notes}</p>}
            <div className="mt-3 border-t border-[#f8f8f8]/[0.08] pt-3">
              <div className="flex items-center justify-between gap-2">
                <TagChips tags={r.tags} empty="No tags yet" />
                <button
                  onClick={() => setOpenTags(openTags === r.id ? null : r.id)}
                  className="shrink-0 text-xs text-[#f8f8f8]/40 hover:text-[#f8f8f8]"
                >
                  {openTags === r.id ? "close" : "manage tags"}
                </button>
              </div>
              {openTags === r.id && (
                <div className="mt-3">
                  <AdminEntityTags kind="reviewer" id={r.id} initialTags={r.tags} />
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Brands
// ---------------------------------------------------------------------------
function BrandsTab({
  supabase,
  brands,
  setBrands,
  onChanged,
}: {
  supabase: Supa
  brands: AdminBrand[]
  setBrands: (b: AdminBrand[]) => void
  onChanged: () => void
}) {
  const [search, setSearch] = useState("")
  const [adding, setAdding] = useState(false)
  const [openTags, setOpenTags] = useState<string | null>(null)

  async function run(e?: React.FormEvent) {
    e?.preventDefault()
    const { data } = await supabase.rpc("admin_list_brands", { search, lim: 200, off: 0 })
    setBrands((data as AdminBrand[]) ?? [])
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          onSubmit={run}
          placeholder="Search brand, site, or email"
        />
        <button onClick={() => setAdding((v) => !v)} className={ghostBtnCls}>
          {adding ? "Close" : "Add brand"}
        </button>
      </div>

      {adding && (
        <AddBrandForm
          supabase={supabase}
          onCreated={async () => {
            setAdding(false)
            await run()
            onChanged()
          }}
        />
      )}

      <p className="mt-3 text-xs text-[#f8f8f8]/40">{brands.length} shown</p>
      <ul className="mt-3 space-y-2">
        {brands.map((b) => (
          <li key={b.id} className="rounded-lg border border-[#f8f8f8]/12 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{b.brand_name}</span>
                  <StatusPill status={b.stage} />
                  {b.bound && <StatusPill status="active" />}
                  {b.match_count > 0 && (
                    <span className="text-xs text-[#f8f8f8]/40">{b.match_count} matches</span>
                  )}
                </div>
                <div className="truncate text-xs text-[#f8f8f8]/50">
                  {[b.website, b.contact_email].filter(Boolean).join(" · ")}
                </div>
              </div>
              <span className="shrink-0 text-xs text-[#f8f8f8]/30">{b.category}</span>
            </div>
            {b.product_description && (
              <p className="mt-2 text-sm text-[#f8f8f8]/70">{b.product_description}</p>
            )}
            <div className="mt-2 text-xs text-[#f8f8f8]/40">
              {[b.contact_name, b.contact_role].filter(Boolean).join(", ")}
            </div>
            <div className="mt-3 border-t border-[#f8f8f8]/[0.08] pt-3">
              <div className="flex items-center justify-between gap-2">
                <TagChips tags={b.tags} empty="No tags yet" />
                <button
                  onClick={() => setOpenTags(openTags === b.id ? null : b.id)}
                  className="shrink-0 text-xs text-[#f8f8f8]/40 hover:text-[#f8f8f8]"
                >
                  {openTags === b.id ? "close" : "manage tags"}
                </button>
              </div>
              {openTags === b.id && (
                <div className="mt-3">
                  <AdminEntityTags kind="brand" id={b.id} initialTags={b.tags} />
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function AddBrandForm({ supabase, onCreated }: { supabase: Supa; onCreated: () => void }) {
  const [form, setForm] = useState({
    brand_name: "",
    website: "",
    category: "",
    contact_name: "",
    contact_role: "",
    contact_email: "",
    product_description: "",
    notes: "",
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError("")
    const { error } = await supabase.rpc("admin_create_brand", { payload: form })
    setBusy(false)
    if (error) {
      setError(error.message)
      return
    }
    onCreated()
  }

  return (
    <form onSubmit={submit} className="mt-4 rounded-lg border border-[#f8f8f8]/12 p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input className={inputCls} placeholder="Brand name *" value={form.brand_name} onChange={(e) => set("brand_name", e.target.value)} required />
        <input className={inputCls} placeholder="Website *" value={form.website} onChange={(e) => set("website", e.target.value)} required />
        <input className={inputCls} placeholder="Category" value={form.category} onChange={(e) => set("category", e.target.value)} />
        <input className={inputCls} placeholder="Contact email *" value={form.contact_email} onChange={(e) => set("contact_email", e.target.value)} required />
        <input className={inputCls} placeholder="Contact name *" value={form.contact_name} onChange={(e) => set("contact_name", e.target.value)} required />
        <input className={inputCls} placeholder="Contact role" value={form.contact_role} onChange={(e) => set("contact_role", e.target.value)} />
      </div>
      <textarea className={`${inputCls} mt-3`} rows={2} placeholder="Product description" value={form.product_description} onChange={(e) => set("product_description", e.target.value)} />
      <textarea className={`${inputCls} mt-3`} rows={2} placeholder="Internal notes" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
      <div className="mt-3 flex items-center gap-3">
        <button type="submit" disabled={busy} className={btnCls}>
          {busy ? "Adding…" : "Add brand"}
        </button>
        {error && <span className="text-sm text-red-400">{error}</span>}
      </div>
    </form>
  )
}

function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  onSubmit: (e?: React.FormEvent) => void
  placeholder: string
}) {
  return (
    <form onSubmit={onSubmit} className="flex flex-1 items-center gap-2">
      <input
        className={inputCls}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button type="submit" className={ghostBtnCls}>
        Search
      </button>
    </form>
  )
}
