import Link from "next/link"

/**
 * Shared, presentational husk UI for the marketplace consoles. Intentionally
 * plain (no hooks) so server components can render it. The visual language is
 * the storefront's blackout mono: #010101 ground, #f8f8f8 ink.
 */

export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-[#f8f8f8]/20 px-3 py-1 text-xs text-[#f8f8f8]/80">
      {children}
    </span>
  )
}

export function StatusPill({ status }: { status: string }) {
  return (
    <span className="rounded-full border border-[#f8f8f8]/25 px-2 py-0.5 text-[11px] uppercase tracking-wide text-[#f8f8f8]/70">
      {status}
    </span>
  )
}

export function Field({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === null || value === undefined || value === "") return null
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-[#f8f8f8]/40">{label}</dt>
      <dd className="mt-1 text-sm break-words">{value}</dd>
    </div>
  )
}

export function ConsoleHeader({ label, email }: { label: string; email?: string | null }) {
  return (
    <header className="flex items-center justify-between border-b border-[#161616] pb-4">
      <div className="flex items-center gap-3">
        <Link href="/" className="text-sm font-medium tracking-tight">
          Blackwell
        </Link>
        <span className="text-[11px] uppercase tracking-[0.2em] text-[#f8f8f8]/40">{label}</span>
      </div>
      <div className="flex items-center gap-4 text-sm text-[#f8f8f8]/50">
        {email ? <span className="hidden truncate sm:inline">{email}</span> : null}
        <form action="/auth/signout" method="post">
          <button className="underline-offset-4 hover:underline">Sign out</button>
        </form>
      </div>
    </header>
  )
}
