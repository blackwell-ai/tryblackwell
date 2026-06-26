"use client"

import { useState } from "react"
import Link from "next/link"
import { BrandMark } from "./brand-mark"

const items = [
  { href: "/brands", label: "Brands" },
  { href: "/labs", label: "Labs" },
  { href: "/evaluators", label: "Evaluators" },
]

const linkCls =
  "font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-[#8f8f8f] transition-colors hover:text-[#f2f2f2]"
const contactCls =
  "rounded-full border border-[#333] px-4 py-1.5 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-[#c9c9c9] transition-colors hover:border-[#5a5a5a] hover:text-[#f2f2f2]"
const CAL = "https://cal.com/team/blackwell/30-min"

export function Nav() {
  const [open, setOpen] = useState(false)

  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="flex items-center justify-between px-8 py-6 sm:px-14">
        <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2.5">
          <BrandMark className="w-5" />
          <span className="font-[family-name:var(--font-serif)] text-lg tracking-tight">
            Blackwell
          </span>
        </Link>

        <nav className="hidden items-center gap-9 sm:flex">
          {items.map((it) => (
            <Link key={it.href} href={it.href} className={linkCls}>
              {it.label}
            </Link>
          ))}
        </nav>

        <a href={CAL} target="_blank" rel="noreferrer" className={`hidden sm:inline-block ${contactCls}`}>
          Contact
        </a>

        <button
          type="button"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="text-[#c9c9c9] transition-colors hover:text-[#f2f2f2] sm:hidden"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
            {open ? (
              <>
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="8" x2="21" y2="8" />
                <line x1="3" y1="16" x2="21" y2="16" />
              </>
            )}
          </svg>
        </button>
      </div>

      {open ? (
        <div className="border-t border-[#161616] bg-[#060606] px-8 py-6 sm:hidden">
          <nav className="flex flex-col gap-5">
            {items.map((it) => (
              <Link key={it.href} href={it.href} onClick={() => setOpen(false)} className={linkCls}>
                {it.label}
              </Link>
            ))}
            <a
              href={CAL}
              target="_blank"
              rel="noreferrer"
              onClick={() => setOpen(false)}
              className={`self-start ${contactCls}`}
            >
              Contact
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  )
}
