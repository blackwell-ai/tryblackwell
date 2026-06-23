"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createSupabaseBrowserClient } from "@/app/lib/supabase/browser"
import { Chip, Field, StatusPill } from "@/app/lib/ui"
import { SelfTagEditor, type Tag } from "@/app/lib/tags"

export type ReviewerProfile = {
  id: string
  name: string
  email: string
  social_handles: string | null
  niches: string[]
  product_interests: string | null
  content_link: string | null
  shipping_address: string | null
  age_verified_at: string | null
  created_at: string
}

export type ReviewerMatch = {
  match_id: string
  status: string
  created_at: string
  brand_id: string
  brand_name: string
  website: string | null
  category: string | null
  product_description: string | null
}

const labelCls = "text-xs uppercase tracking-wide text-[#f8f8f8]/40"
const inputCls =
  "mt-1 w-full rounded-md border border-[#f8f8f8]/20 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-[#f8f8f8]/25 focus:border-[#f8f8f8]/50"

export function ReviewerView({
  email,
  displayName,
  profile,
  matches,
  initialTags,
}: {
  email: string
  displayName: string | null
  profile: ReviewerProfile | null
  matches: ReviewerMatch[]
  initialTags: Tag[]
}) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [tags, setTags] = useState<Tag[]>(initialTags)
  const [synth, setSynth] = useState<"idle" | "running">("idle")

  // Signup is just OAuth + an 18+ attestation — no application. Anyone who
  // hasn't joined yet (no row) or hasn't confirmed their age sees the gate.
  if (!profile?.age_verified_at) {
    return <AgeGate email={email} displayName={displayName} onJoined={() => router.refresh()} />
  }

  async function afterSave() {
    setEditing(false)
    router.refresh()
    // AI-synthesize tags from the updated interests, then refresh the chips.
    setSynth("running")
    try {
      await fetch("/api/tags/synthesize", { method: "POST" })
      const supabase = createSupabaseBrowserClient()
      const { data } = await supabase.rpc("my_tags")
      if (Array.isArray(data)) setTags(data as Tag[])
    } catch {
      /* AI optional — ignore failures */
    }
    setSynth("idle")
  }

  return (
    <div className="mt-8 space-y-12">
      {editing ? (
        <ProfileForm
          email={email}
          profile={profile}
          onDone={afterSave}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <ProfileCard profile={profile} onEdit={() => setEditing(true)} />
      )}

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-[#f8f8f8]/50">
            Interests &amp; tags
          </h2>
          {synth === "running" && <span className="text-xs text-[#f8f8f8]/40">✦ generating…</span>}
        </div>
        <p className="mt-2 max-w-prose text-xs leading-relaxed text-[#f8f8f8]/40">
          These power your brand matches. We auto-generate tags from your interests when you save —
          and you can add your own anytime.
        </p>
        <div className="mt-4">
          <SelfTagEditor tags={tags} onChange={setTags} />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-[#f8f8f8]/50">
          Your brand matches
        </h2>
        {matches.length === 0 ? (
          <p className="mt-4 text-sm text-[#f8f8f8]/50">
            No matches yet. Our team pairs reviewers with brands by hand for now — once you&apos;re
            matched, the brands will appear here.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {matches.map((m) => (
              <li
                key={m.match_id}
                className="rounded-lg border border-[#f8f8f8]/12 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">{m.brand_name}</span>
                  <StatusPill status={m.status} />
                </div>
                {m.category && (
                  <p className="mt-1 text-xs uppercase tracking-wide text-[#f8f8f8]/40">
                    {m.category}
                  </p>
                )}
                {m.product_description && (
                  <p className="mt-2 text-sm text-[#f8f8f8]/70">{m.product_description}</p>
                )}
                {m.website && (
                  <a
                    href={m.website.startsWith("http") ? m.website : `https://${m.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-xs text-[#f8f8f8]/60 underline underline-offset-4"
                  >
                    {m.website}
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function AgeGate({
  email,
  displayName,
  onJoined,
}: {
  email: string
  displayName: string | null
  onJoined: () => void
}) {
  const [confirmed, setConfirmed] = useState(false)
  const [status, setStatus] = useState<"idle" | "joining" | "error">("idle")
  const [message, setMessage] = useState("")

  async function join() {
    if (!confirmed) return
    setStatus("joining")
    setMessage("")
    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase.rpc("join_reviewer", { display_name: displayName })
    if (error) {
      setStatus("error")
      setMessage(error.message)
      return
    }
    onJoined()
  }

  return (
    <section className="mt-16 max-w-md">
      <h1 className="text-2xl font-medium tracking-tight">Welcome to Blackwell</h1>
      <p className="mt-2 text-sm text-[#f8f8f8]/60">
        You&apos;re signed in as <span className="text-[#f8f8f8]">{email}</span>. One quick thing
        before you start receiving products.
      </p>

      <label className="mt-8 flex cursor-pointer items-start gap-3 rounded-lg border border-[#f8f8f8]/15 p-4 hover:border-[#f8f8f8]/30">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-[#f8f8f8]"
        />
        <span className="text-sm text-[#f8f8f8]/80">I confirm I am 18 years of age or older.</span>
      </label>

      <button
        onClick={join}
        disabled={!confirmed || status === "joining"}
        className="mt-6 rounded-md bg-[#f8f8f8] px-5 py-2.5 text-sm font-medium text-[#010101] transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        {status === "joining" ? "Joining…" : "Join the reviewer network"}
      </button>

      {status === "error" && (
        <p className="mt-3 text-sm text-red-400">{message || "Something went wrong."}</p>
      )}

      <p className="mt-8 text-xs leading-relaxed text-[#f8f8f8]/40">
        That&apos;s it — no application. Add your interests and shipping details anytime from your
        profile so we can match you with the right products.
      </p>
    </section>
  )
}

function ProfileCard({ profile, onEdit }: { profile: ReviewerProfile; onEdit: () => void }) {
  return (
    <section>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">{profile.name}</h1>
          <p className="mt-1 text-sm text-[#f8f8f8]/60">{profile.email}</p>
        </div>
        <button
          onClick={onEdit}
          className="shrink-0 rounded-md border border-[#f8f8f8]/25 px-3 py-1.5 text-sm hover:bg-[#f8f8f8]/5"
        >
          Edit profile
        </button>
      </div>

      {profile.niches?.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {profile.niches.map((n) => (
            <Chip key={n}>{n}</Chip>
          ))}
        </div>
      )}

      <dl className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Social" value={profile.social_handles} />
        <Field label="Content" value={profile.content_link} />
        <Field label="Product interests" value={profile.product_interests} />
        <Field label="Shipping address" value={profile.shipping_address} />
      </dl>

      <p className="mt-10 text-xs text-[#f8f8f8]/40">
        Member since {new Date(profile.created_at).toLocaleDateString()}
      </p>
    </section>
  )
}

function ProfileForm({
  email,
  profile,
  onDone,
  onCancel,
}: {
  email: string
  profile: ReviewerProfile | null
  onDone: () => void
  onCancel?: () => void
}) {
  const [form, setForm] = useState({
    name: profile?.name ?? "",
    social_handles: profile?.social_handles ?? "",
    content_link: profile?.content_link ?? "",
    product_interests: profile?.product_interests ?? "",
    shipping_address: profile?.shipping_address ?? "",
    niches: (profile?.niches ?? []).join(", "),
  })
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle")
  const [message, setMessage] = useState("")

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("saving")
    setMessage("")
    const supabase = createSupabaseBrowserClient()
    const payload = {
      ...form,
      niches: form.niches
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    }
    const { error } = await supabase.rpc("upsert_my_reviewer", { payload })
    if (error) {
      setStatus("error")
      setMessage(error.message)
      return
    }
    onDone()
  }

  return (
    <section>
      <h1 className="text-2xl font-medium tracking-tight">
        {profile ? "Edit your profile" : "Welcome — tell us about you"}
      </h1>
      <p className="mt-1 text-sm text-[#f8f8f8]/60">
        Signed in as {email}. This is what brands see when we match you.
      </p>

      <form onSubmit={onSubmit} className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className={labelCls}>Name</span>
          <input
            className={inputCls}
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Your name"
            required
          />
        </label>
        <label>
          <span className={labelCls}>Social handles</span>
          <input
            className={inputCls}
            value={form.social_handles}
            onChange={(e) => set("social_handles", e.target.value)}
            placeholder="@you"
          />
        </label>
        <label>
          <span className={labelCls}>Content link</span>
          <input
            className={inputCls}
            value={form.content_link}
            onChange={(e) => set("content_link", e.target.value)}
            placeholder="Link to your best work"
          />
        </label>
        <label className="sm:col-span-2">
          <span className={labelCls}>Niches (comma-separated)</span>
          <input
            className={inputCls}
            value={form.niches}
            onChange={(e) => set("niches", e.target.value)}
            placeholder="fitness, streetwear, tech"
          />
        </label>
        <label className="sm:col-span-2">
          <span className={labelCls}>Product interests</span>
          <textarea
            className={inputCls}
            rows={2}
            value={form.product_interests}
            onChange={(e) => set("product_interests", e.target.value)}
            placeholder="What kinds of products do you want to review?"
          />
        </label>
        <label className="sm:col-span-2">
          <span className={labelCls}>Shipping address</span>
          <textarea
            className={inputCls}
            rows={2}
            value={form.shipping_address}
            onChange={(e) => set("shipping_address", e.target.value)}
            placeholder="Where we ship gifted product"
          />
        </label>

        <div className="flex items-center gap-3 sm:col-span-2">
          <button
            type="submit"
            disabled={status === "saving"}
            className="rounded-md bg-[#f8f8f8] px-4 py-2 text-sm font-medium text-[#010101] transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {status === "saving" ? "Saving…" : "Save profile"}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-sm text-[#f8f8f8]/60 underline-offset-4 hover:underline"
            >
              Cancel
            </button>
          )}
          {status === "error" && (
            <span className="text-sm text-red-400">{message || "Something went wrong."}</span>
          )}
        </div>
      </form>
    </section>
  )
}
