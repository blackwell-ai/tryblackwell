import { redirect } from "next/navigation"
import { getWho } from "@/app/lib/portal"
import { ConsoleHeader } from "@/app/lib/ui"
import {
  AdminConsole,
  type AdminStats,
  type AdminReviewer,
  type AdminBrand,
  type AdminMatch,
} from "./admin-console"

export const metadata = { title: "Admin — Blackwell" }

export default async function AdminPage() {
  const { supabase, user, who } = await getWho()
  if (!user) redirect("/login")
  // Non-admins get bounced to their own console via the dispatcher.
  if (who?.role !== "admin") redirect("/dashboard")

  const [{ data: stats }, { data: reviewers }, { data: brands }, { data: matches }] =
    await Promise.all([
      supabase.rpc("admin_stats"),
      supabase.rpc("admin_list_reviewers", { search: "", lim: 200, off: 0 }),
      supabase.rpc("admin_list_brands", { search: "", lim: 200, off: 0 }),
      supabase.rpc("admin_list_matches", {}),
    ])

  return (
    <main className="min-h-screen w-full bg-[#010101] px-6 py-10 text-[#f8f8f8]">
      <div className="mx-auto w-full max-w-5xl">
        <ConsoleHeader label="Admin console" email={who?.email} />
        <AdminConsole
          initialStats={(stats as AdminStats | null) ?? null}
          initialReviewers={(reviewers as AdminReviewer[] | null) ?? []}
          initialBrands={(brands as AdminBrand[] | null) ?? []}
          initialMatches={(matches as AdminMatch[] | null) ?? []}
        />
      </div>
    </main>
  )
}
