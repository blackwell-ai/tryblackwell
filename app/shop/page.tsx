import Link from "next/link"
import { products } from "./products"

export default function ShopIndex() {
  return (
    <section>
      <div className="grid grid-cols-1 border-l border-[#161616] sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p, i) => (
          <Link
            key={p.handle}
            href={`/shop/${p.handle}`}
            className="group border-b border-r border-[#161616]"
          >
            <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_38%,#1d1d1d,#050505_72%)]">
              {p.image ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} alt={p.name} className="h-full w-full object-cover transition-opacity duration-500 group-hover:opacity-0" />
                  {p.back && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.back} alt={`${p.name} back`} className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  )}
                </>
              ) : (
                <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.35em] text-[#3a3a3a]">
                  image
                </span>
              )}
              <span className="absolute left-4 top-4 font-[family-name:var(--font-mono)] text-[11px] tracking-widest text-[#5a5a5a]">
                {String(i + 1).padStart(2, "0")}/
              </span>
            </div>
            <div className="flex items-baseline justify-between px-5 py-4 font-[family-name:var(--font-mono)] text-[12px] uppercase tracking-[0.15em]">
              <span className="text-[#cfcfcf] transition-colors group-hover:text-[var(--accent)]">
                {p.name}
              </span>
              <span className="text-[#7a7a7a]">{p.price ? `$${p.price}` : "—"}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
