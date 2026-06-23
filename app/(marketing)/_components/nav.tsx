"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { BrandMark } from "@/app/lib/brand-mark"

const links = [
  { href: "/brands", label: "For brands" },
  { href: "/reviewers", label: "For reviewers" },
]

export function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <nav
      data-scrolled={scrolled}
      className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-transparent bg-[#010101]/80 px-5 py-3 backdrop-blur-xl transition-colors data-[scrolled=true]:border-[#161616] md:px-10"
    >
      <Link href="/" aria-label="Blackwell home" className="flex flex-1 items-center gap-2.5">
        <BrandMark className="w-5" />
        <span className="text-sm font-medium tracking-tight">Blackwell</span>
      </Link>

      <div className="hidden flex-1 items-center justify-center gap-8 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] md:flex">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="text-[#7a7a7a] transition-colors hover:text-[#f8f8f8]">
            {l.label}
          </Link>
        ))}
      </div>

      <div className="flex flex-1 justify-end">
        <Link
          href="/login"
          className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-[#f8f8f8] transition-opacity hover:opacity-70"
        >
          Sign in
        </Link>
      </div>
    </nav>
  )
}
