import Link from "next/link"

/* Presentational husk-marketing primitives in the blackout-mono language:
   #010101 ground, #f8f8f8 ink, serif display + mono labels, no color accent. */

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.25em] text-[#7a7a7a]">
      {children}
    </span>
  )
}

export function Cta({
  href,
  children,
  variant = "primary",
  arrow = "→",
}: {
  href: string
  children: React.ReactNode
  variant?: "primary" | "ghost"
  arrow?: string
}) {
  const base =
    "group inline-flex items-center gap-2 px-6 py-3.5 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
  const styles =
    variant === "primary"
      ? "bg-[#f8f8f8] text-[#010101] hover:opacity-90"
      : "border border-[#f8f8f8]/30 text-[#f8f8f8] hover:bg-[#f8f8f8]/5"
  return (
    <Link href={href} className={`${base} ${styles}`}>
      {children}
      <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">
        {arrow}
      </span>
    </Link>
  )
}

export function Marquee({ items }: { items: string[] }) {
  const row = [...items, ...items]
  return (
    <div className="overflow-hidden border-y border-[#161616] py-6">
      <div className="flex w-max animate-marquee gap-12 pr-12">
        {row.map((s, i) => (
          <span
            key={`${s}-${i}`}
            className="flex items-center gap-12 whitespace-nowrap font-[family-name:var(--font-serif)] text-2xl text-[#f8f8f8]/70"
          >
            {s}
            <span aria-hidden className="text-xs text-[#f8f8f8]/20">
              ✦
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}

export function PathCard({
  label,
  title,
  titleEm,
  bullets,
  ctaHref,
  ctaLabel,
}: {
  label: string
  title: string
  titleEm: string
  bullets: string[]
  ctaHref: string
  ctaLabel: string
}) {
  return (
    <div className="flex flex-col border border-[#161616] bg-[#0a0a0a] p-8 transition-colors hover:border-[#f8f8f8]/25 md:p-10">
      <Eyebrow>{label}</Eyebrow>
      <h3 className="mt-4 font-[family-name:var(--font-serif)] text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.05] tracking-tight">
        {title} <span className="font-normal italic text-[#f8f8f8]/70">{titleEm}</span>
      </h3>
      <ul className="mt-8 space-y-4 border-t border-[#161616] pt-8">
        {bullets.map((b, i) => (
          <li key={b} className="flex gap-4">
            <span className="font-[family-name:var(--font-mono)] text-xs text-[#7a7a7a]">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="text-[15px] leading-relaxed text-[#f8f8f8]/80">{b}</span>
          </li>
        ))}
      </ul>
      <div className="mt-10">
        <Cta href={ctaHref} variant="ghost">
          {ctaLabel}
        </Cta>
      </div>
    </div>
  )
}

export function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="border-t border-[#f8f8f8]/15 pt-5">
      <span className="font-[family-name:var(--font-mono)] text-xs text-[#7a7a7a]">{n}</span>
      <h3 className="mt-3 font-[family-name:var(--font-serif)] text-xl tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[#f8f8f8]/60">{body}</p>
    </div>
  )
}

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="border-t border-[#161616]">
      {items.map((it) => (
        <details key={it.q} className="group border-b border-[#161616]">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-6 font-[family-name:var(--font-serif)] text-lg tracking-tight">
            {it.q}
            <span
              aria-hidden
              className="shrink-0 text-xl text-[#7a7a7a] transition-transform duration-200 group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="max-w-[64ch] pb-6 text-[15px] leading-relaxed text-[#f8f8f8]/60">{it.a}</p>
        </details>
      ))}
    </div>
  )
}
