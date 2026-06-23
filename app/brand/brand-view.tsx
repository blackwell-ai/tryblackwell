"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createSupabaseBrowserClient } from "@/app/lib/supabase/browser"
import { Chip, Field, StatusPill } from "@/app/lib/ui"

export type BrandProfile = {
  id: string
  brand_name: string
  website: string | null
  category: string | null
  product_description: string | null
  contact_name: string | null
  contact_role: string | null
  contact_email: string
  stage: string
  created_at: string
}

export type BrandMatch = {
  match_id: string
  status: string
  created_at: string
  reviewer_id: string
  name: string
  niches: string[]
  social_handles: string | null
  content_link: string | null
  product_interests: string | null
}

const labelCls = "text-xs uppercase tracking-wide text-[#f8f8f8]/40"
const inputCls =
  "mt-1 w-full rounded-md border border-[#f8f8f8]/20 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-[#f8f8f8]/25 focus:border-[#f8f8f8]/50"

export function BrandView({ brand, matches }: { brand: BrandProfile; matches: BrandMatch[] }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)

  return (
    <div className="mt-8 space-y-12">
      {editing ? (
        <BrandForm
          brand={brand}
          onDone={() => {
            setEditing(false)
            router.refresh()
          }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <section>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-medium tracking-tight">{brand.brand_name}</h1>
                <StatusPill status={brand.stage} />
              </div>
              {brand.website && (
                <a
                  href={brand.website.startsWith("http") ? brand.website : `https://${brand.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-block text-sm text-[#f8f8f8]/60 underline underline-offset-4"
                >
                  {brand.website}
                </a>
              )}
            </div>
            <button
              onClick={() => setEditing(true)}
              className="shrink-0 rounded-md border border-[#f8f8f8]/25 px-3 py-1.5 text-sm hover:bg-[#f8f8f8]/5"
            >
              Edit
            </button>
          </div>

          <dl className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Category" value={brand.category} />
            <Field label="Contact" value={brand.contact_name} />
            <Field label="Role" value={brand.contact_role} />
            <Field label="Contact email" value={brand.contact_email} />
            <div className="sm:col-span-2">
              <Field label="Product description" value={brand.product_description} />
            </div>
          </dl>
        </section>
      )}

      <section>
        <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-[#f8f8f8]/50">
          Matched reviewers
        </h2>
        {matches.length === 0 ? (
          <p className="mt-4 text-sm text-[#f8f8f8]/50">
            No reviewers matched yet. Our team curates matches by hand for now — they&apos;ll show
            up here once paired.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {matches.map((m) => (
              <li key={m.match_id} className="rounded-lg border border-[#f8f8f8]/12 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">{m.name}</span>
                  <StatusPill status={m.status} />
                </div>
                {m.niches?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {m.niches.map((n) => (
                      <Chip key={n}>{n}</Chip>
                    ))}
                  </div>
                )}
                {m.product_interests && (
                  <p className="mt-3 text-sm text-[#f8f8f8]/70">{m.product_interests}</p>
                )}
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-[#f8f8f8]/60">
                  {m.social_handles && <span>{m.social_handles}</span>}
                  {m.content_link && (
                    <a
                      href={m.content_link.startsWith("http") ? m.content_link : `https://${m.content_link}`}
                      target="_blank"
                      rel="noreferrer"
                      className="underline underline-offset-4"
                    >
                      Content
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function BrandForm({
  brand,
  onDone,
  onCancel,
}: {
  brand: BrandProfile
  onDone: () => void
  onCancel: () => void
}) {
  const [form, setForm] = useState({
    brand_name: brand.brand_name ?? "",
    website: brand.website ?? "",
    category: brand.category ?? "",
    product_description: brand.product_description ?? "",
    contact_name: brand.contact_name ?? "",
    contact_role: brand.contact_role ?? "",
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
    const { error } = await supabase.rpc("update_my_brand", { payload: form })
    if (error) {
      setStatus("error")
      setMessage(error.message)
      return
    }
    onDone()
  }

  return (
    <section>
      <h1 className="text-2xl font-medium tracking-tight">Edit brand profile</h1>
      <form onSubmit={onSubmit} className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className={labelCls}>Brand name</span>
          <input className={inputCls} value={form.brand_name} onChange={(e) => set("brand_name", e.target.value)} required />
        </label>
        <label>
          <span className={labelCls}>Website</span>
          <input className={inputCls} value={form.website} onChange={(e) => set("website", e.target.value)} required />
        </label>
        <label>
          <span className={labelCls}>Category</span>
          <input className={inputCls} value={form.category} onChange={(e) => set("category", e.target.value)} />
        </label>
        <label>
          <span className={labelCls}>Contact name</span>
          <input className={inputCls} value={form.contact_name} onChange={(e) => set("contact_name", e.target.value)} required />
        </label>
        <label>
          <span className={labelCls}>Contact role</span>
          <input className={inputCls} value={form.contact_role} onChange={(e) => set("contact_role", e.target.value)} />
        </label>
        <label className="sm:col-span-2">
          <span className={labelCls}>Product description</span>
          <textarea
            className={inputCls}
            rows={3}
            value={form.product_description}
            onChange={(e) => set("product_description", e.target.value)}
          />
        </label>
        <div className="flex items-center gap-3 sm:col-span-2">
          <button
            type="submit"
            disabled={status === "saving"}
            className="rounded-md bg-[#f8f8f8] px-4 py-2 text-sm font-medium text-[#010101] transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {status === "saving" ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-[#f8f8f8]/60 underline-offset-4 hover:underline"
          >
            Cancel
          </button>
          {status === "error" && (
            <span className="text-sm text-red-400">{message || "Something went wrong."}</span>
          )}
        </div>
      </form>
    </section>
  )
}
