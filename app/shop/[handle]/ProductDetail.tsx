"use client"
import { useState } from "react"
import type { Product } from "../products"

export default function ProductDetail({ product }: { product: Product }) {
  const genders = product.genders ?? []
  const [gender, setGender] = useState<string | null>(genders[0] ?? null)

  const modelImg = product.model
    ? gender
      ? product.model[gender]
      : Object.values(product.model)[0]
    : undefined

  const views = (
    [
      product.image ? { key: "front", src: product.image } : null,
      product.back ? { key: "back", src: product.back } : null,
      modelImg ? { key: "model", src: modelImg } : null,
    ].filter(Boolean) as { key: string; src: string }[]
  )

  const [viewKey, setViewKey] = useState("front")
  const main = views.find((v) => v.key === viewKey)?.src ?? views[0]?.src

  const [size, setSize] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function buy() {
    setMsg(null)
    if (genders.length > 1 && !gender) { setMsg("Select a fit."); return }
    if (!size) { setMsg("Select a size."); return }
    setLoading(true)
    try {
      const res = await fetch("/shop/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: product.handle, size, gender }),
      })
      const data = await res.json()
      if (data.url) { window.location.href = data.url; return }
      setMsg(data.error || "Unavailable.")
    } catch {
      setMsg("Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-2">
      {/* gallery */}
      <div className="border-b border-[#161616] md:border-b-0 md:border-r">
        <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_40%,#1d1d1d,#050505_72%)] md:aspect-auto md:h-[78vh]">
          {main && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={main} alt={product.name} className="h-full w-full object-cover" />
          )}
        </div>
        {views.length > 1 && (
          <div className="flex gap-3 p-4 md:p-5">
            {views.map((v) => (
              <button
                key={v.key}
                onClick={() => setViewKey(v.key)}
                className={`h-16 w-16 overflow-hidden border transition-colors ${
                  viewKey === v.key ? "border-[var(--accent)]" : "border-[#262626] hover:border-[#4a4a4a]"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={v.src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* info */}
      <div className="px-6 py-12 md:px-12 md:py-20">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{product.name}</h1>
        <p className="mt-3 font-[family-name:var(--font-mono)] text-sm tracking-[0.2em] text-[#7a7a7a]">
          {product.price ? `$${product.price}` : "NOT PRICED YET"}
        </p>

        {genders.length > 1 && (
          <div className="mt-8 font-[family-name:var(--font-mono)]">
            <div className="text-[10px] uppercase tracking-[0.35em] text-[#6a6a6a]">Fit</div>
            <div className="mt-3 flex gap-2">
              {genders.map((g) => (
                <button
                  key={g}
                  onClick={() => { setGender(g); setViewKey("model") }}
                  className={`h-11 border px-5 text-xs uppercase tracking-[0.2em] transition-colors ${
                    gender === g
                      ? "border-[var(--accent)] text-[var(--accent)]"
                      : "border-[#262626] text-[#9a9a9a] hover:border-[#4a4a4a]"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 font-[family-name:var(--font-mono)]">
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
        </div>

        <button
          onClick={buy}
          disabled={loading}
          className="mt-9 h-12 w-full max-w-xs bg-[var(--accent)] font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.3em] text-[#010101] transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "..." : "Buy"}
        </button>
        {msg && (
          <p className="mt-3 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-[#9a9a9a]">
            {msg}
          </p>
        )}
      </div>
    </section>
  )
}
