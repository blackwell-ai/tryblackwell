/**
 * Local-only role preview switcher. Renders nothing in production. Uses plain
 * <a> tags (not next/link) so Next never prefetches /auth/dev — those GETs mint
 * a session as a side effect, which prefetch must not trigger.
 */
export function DevBar() {
  if (process.env.NODE_ENV === "production") return null

  const item =
    "rounded px-2.5 py-1 text-[#f8f8f8]/70 transition-colors hover:bg-[#f8f8f8]/10 hover:text-[#f8f8f8]"

  return (
    <div className="fixed bottom-3 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full border border-[#f8f8f8]/15 bg-[#0a0a0a]/95 px-2 py-1 text-xs shadow-xl backdrop-blur">
      <span className="px-2 text-[10px] uppercase tracking-[0.2em] text-[#f8f8f8]/35">
        Preview
      </span>
      <a href="/auth/dev?role=reviewer" className={item}>
        Reviewer
      </a>
      <a href="/auth/dev?role=brand" className={item}>
        Brand
      </a>
      <a href="/auth/dev?role=admin" className={item}>
        Admin
      </a>
      <span className="text-[#f8f8f8]/15">|</span>
      <form action="/auth/signout" method="post" className="flex">
        <button className={item}>Sign out</button>
      </form>
    </div>
  )
}
