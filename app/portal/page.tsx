import { redirect } from "next/navigation"
import { getWho } from "@/app/lib/portal"
import { ConsoleHeader } from "@/app/lib/ui"
import { ReviewerView, type ReviewerProfile, type ReviewerMatch } from "./reviewer-view"

export const metadata = { title: "Reviewer portal — Blackwell" }

export default async function PortalPage() {
  const { supabase, user, who } = await getWho()
  if (!user) redirect("/login")
  // Other roles have their own consoles; /portal is for reviewers (and brand-new
  // signups, who land here with role "none" to fill out a profile).
  if (who?.role === "admin") redirect("/admin")
  if (who?.role === "brand") redirect("/brand")

  const { data: profile } = await supabase.rpc("claim_reviewer")
  const { data: matches } = await supabase.rpc("my_reviewer_matches")

  // From the OAuth identity (e.g. Google), used to prefill the name on join.
  const meta = user.user_metadata as { full_name?: string; name?: string } | undefined
  const displayName = meta?.full_name ?? meta?.name ?? null

  return (
    <main className="min-h-screen w-full bg-[#010101] px-6 py-10 text-[#f8f8f8]">
      <div className="mx-auto w-full max-w-2xl">
        <ConsoleHeader label="Reviewer" email={who?.email} />
        <ReviewerView
          email={who?.email ?? user.email ?? ""}
          displayName={displayName}
          profile={(profile as ReviewerProfile | null) ?? null}
          matches={(matches as ReviewerMatch[] | null) ?? []}
        />
      </div>
    </main>
  )
}
