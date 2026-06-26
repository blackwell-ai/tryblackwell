"use client"

import { useState } from "react"

const CATEGORIES = [
  "Beauty & skincare",
  "Health, wellness & supplements",
  "Home & kitchen",
  "Tech & gadgets",
  "Food & beverage",
  "Fashion & accessories",
  "Baby & kids",
  "Pet",
  "Fitness & outdoors",
  "Household & cleaning",
  "Other",
]

const inputCls =
  "w-full border border-[#2a2a2a] bg-transparent px-3 py-2.5 font-sans text-[14px] text-[#e8e8e8] placeholder-[#5a5a5a] outline-none transition-colors focus:border-[#5a5a5a]"
const labelCls =
  "block font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.2em] text-[#7a7a7a]"

export function EvaluatorForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [products, setProducts] = useState<string[]>([])
  const [address, setAddress] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle")
  const [err, setErr] = useState("")

  function toggle(c: string) {
    setProducts((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("loading")
    setErr("")
    const res = await fetch("/api/evaluators", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, products: products.join(", "), address }),
    })
    if (res.ok) {
      setStatus("done")
    } else {
      const j = await res.json().catch(() => ({}))
      setErr(j.error || "Something went wrong.")
      setStatus("error")
    }
  }

  if (status === "done") {
    return (
      <p className="mt-12 font-[family-name:var(--font-mono)] text-[13px] tracking-wide text-[#c9c9c9]">
        Thanks. You are on the list.
      </p>
    )
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 space-y-6 text-left">
      <div>
        <label className={labelCls}>Name</label>
        <input
          className={`${inputCls} mt-2`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
        />
      </div>

      <div>
        <label className={labelCls}>Email</label>
        <input
          type="email"
          required
          className={`${inputCls} mt-2`}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
        />
      </div>

      <div>
        <label className={labelCls}>What you want to test</label>
        <div className="mt-3 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => {
            const on = products.includes(c)
            return (
              <button
                type="button"
                key={c}
                onClick={() => toggle(c)}
                className={`rounded-full border px-3 py-1 font-sans text-[12px] transition-colors ${
                  on
                    ? "border-[#e8e8e8] bg-[#e8e8e8] text-[#0a0a0a]"
                    : "border-[#2a2a2a] text-[#9a9a9a] hover:border-[#4a4a4a]"
                }`}
              >
                {c}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <label className={labelCls}>Shipping address</label>
        <textarea
          className={`${inputCls} mt-2 resize-none`}
          rows={3}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Where products ship"
        />
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-full bg-[#f2f2f2] px-5 py-3 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-[#0a0a0a] transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {status === "loading" ? "Sending..." : "Apply to review"}
      </button>

      {err ? <p className="font-sans text-[13px] text-[#e0a0a0]">{err}</p> : null}
    </form>
  )
}
