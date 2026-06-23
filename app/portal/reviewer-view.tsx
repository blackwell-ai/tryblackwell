"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createSupabaseBrowserClient } from "@/app/lib/supabase/browser"
import { Chip, Field, StatusPill } from "@/app/lib/ui"

export type ReviewerProfile = {
  id: string
  name: string
  email: string
  social_handles: string | null
  niches: string[]
  product_interests: string | null
  content_link: string | null
  shipping_address: string | null
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
  profile,
  matches,
}: {
  email: string
  profile: ReviewerProfile | null
  matches: ReviewerMatch[]
}) {
  const router = useRouter()
  // New applicants (no row yet) open straight into the form.
  const [editing, setEditing] = useState(profile === null)

  return (
    <div className="mt-8 space-y-12">
      {editing ? (
        <ProfileForm
          email={email}
          profile={profile}
          onDone={() => {
            setEditing(false)
            router.refresh()
          }}
          onCancel={profile ? () => setEditing(false) : undefined}
        />
      ) : (
        <ProfileCard profile={profile!} onEdit={() => setEditing(true)} />
      )}

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
