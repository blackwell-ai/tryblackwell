import Link from "next/link"
import { BrandMark } from "@/app/lib/brand-mark"

function Col({ heading, links }: { heading: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h4 className="mb-4 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.25em] text-[#7a7a7a]">
        {heading}
      </h4>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link href={l.href} className="text-sm text-[#f8f8f8]/70 transition-colors hover:text-[#f8f8f8]">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-[#161616] px-5 pb-10 pt-14 md:px-10 md:pt-20">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-12 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" aria-label="Blackwell home" className="flex items-center gap-2.5">
              <BrandMark className="w-6" />
              <span className="text-base font-medium tracking-tight">Blackwell</span>
            </Link>
            <p className="mt-4 max-w-[34ch] text-sm leading-relaxed text-[#7a7a7a]">
              The generative-engine optimization layer for brands — and the review network that
              feeds it. We make products legible to AI.
            </p>
          </div>

          <Col
            heading="Platform"
            links={[
              { href: "/brands", label: "For brands" },
              { href: "/reviewers", label: "For reviewers" },
              { href: "/shop", label: "Shop" },
              { href: "/login", label: "Sign in" },
            ]}
          />
          <Col
            heading="Company"
            links={[
              { href: "/#how", label: "How it works" },
              { href: "/#thesis", label: "Why Blackwell" },
              { href: "mailto:founders@tryblackwell.com", label: "Contact" },
            ]}
          />
          <Col
            heading="Follow"
            links={[
              { href: "https://instagram.com", label: "Instagram" },
              { href: "https://x.com", label: "X" },
              { href: "https://linkedin.com", label: "LinkedIn" },
            ]}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#161616] pt-8 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-[#7a7a7a]">
          <span>© {new Date().getFullYear()} Blackwell</span>
          <span>tryblackwell.com</span>
        </div>
      </div>
    </footer>
  )
}
