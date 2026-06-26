"use client"

import { useState } from "react"

const inputCls =
  "w-full border border-[#2a2a2a] bg-transparent px-3 py-2.5 font-sans text-[14px] text-[#e8e8e8] placeholder-[#5a5a5a] outline-none transition-colors focus:border-[#5a5a5a]"
const labelCls =
  "block font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.2em] text-[#7a7a7a]"

export function BrandForm() {
  const [email, setEmail] = useState("")
  const [brandUrl, setBrandUrl] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle")
  const [err, setErr] = useState("")

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("loading")
    setErr("")
    const res = await fetch("/api/brands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brandUrl, email }),
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
      <p className="mt-8 font-[family-name:var(--font-mono)] text-[13px] tracking-wide text-[#c9c9c9]">
        Got it. We will be in touch.
      </p>
    )
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto mt-8 max-w-sm space-y-5 text-left">
      <div>
        <label className={labelCls}>Email</label>
        <input
          type="email"
          className={`${inputCls} mt-2`}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
        />
      </div>

      <div>
        <label className={labelCls}>Store URL</label>
        <input
          type="url"
          required
          className={`${inputCls} mt-2`}
          value={brandUrl}
          onChange={(e) => setBrandUrl(e.target.value)}
          placeholder="yourstore.com"
        />
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-full bg-[#f2f2f2] px-5 py-3 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-[#0a0a0a] transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {status === "loading" ? "Sending..." : "Analyze my brand"}
      </button>

      {err ? <p className="font-sans text-[13px] text-[#e0a0a0]">{err}</p> : null}
    </form>
  )
}
