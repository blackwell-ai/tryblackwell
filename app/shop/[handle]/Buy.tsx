"use client"
import { useState } from "react"
import type { Product } from "../products"

export default function Buy({ product }: { product: Product }) {
  const [size, setSize] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function buy() {
    setMsg(null)
    if (!size) {
      setMsg("Select a size.")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/shop/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: product.handle, size }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
        return
      }
      setMsg(data.error || "Unavailable.")
    } catch {
      setMsg("Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-10 font-[family-name:var(--font-mono)]">
      <div className="text-[10px] uppercase tracking-[0.35em] text-[#6a6a6a]">Size</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {product.sizes.map((s) => (
          <button
            key={s}
            onClick={() => setSize(s)}
            className={`h-11 min-w-12 border text-xs transition-colors ${
              size === s
                ? "border-[var(--accent)] text-[var(--accent)]"
                : "border-[#262626] text-[#9a9a9a] hover:border-[#4a4a4a]"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      <button
        onClick={buy}
        disabled={loading}
        className="mt-7 h-12 w-full max-w-xs bg-[var(--accent)] text-xs uppercase tracking-[0.3em] text-[#010101] transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "..." : "Buy"}
      </button>
      {msg && (
        <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-[#9a9a9a]">{msg}</p>
      )}
    </div>
  )
}
