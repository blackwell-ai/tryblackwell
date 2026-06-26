import Link from "next/link"
import { BrandMark } from "./brand-mark"

const items = [
  { href: "/brands", label: "Brands" },
  { href: "/labs", label: "Labs" },
  { href: "/evaluators", label: "Evaluators" },
]

export function Nav() {
  return (
    <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-8 py-6 sm:px-14">
      <Link href="/" className="flex items-center gap-2.5">
        <BrandMark className="w-5" />
        <span className="font-[family-name:var(--font-serif)] text-lg tracking-tight">
          Blackwell
        </span>
      </Link>

      <nav className="hidden items-center gap-9 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-[#8f8f8f] sm:flex">
        {items.map((it) => (
          <Link key={it.href} href={it.href} className="transition-colors hover:text-[#f2f2f2]">
            {it.label}
          </Link>
        ))}
      </nav>

      <a
        href="https://cal.com/team/blackwell/30-min"
        target="_blank"
        rel="noreferrer"
        className="rounded-full border border-[#333] px-4 py-1.5 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-[#c9c9c9] transition-colors hover:border-[#5a5a5a] hover:text-[#f2f2f2]"
      >
        Contact
      </a>
    </header>
  )
}
