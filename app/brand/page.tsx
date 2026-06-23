import { redirect } from "next/navigation"
import { getWho } from "@/app/lib/portal"
import { ConsoleHeader } from "@/app/lib/ui"
import { BrandView, type BrandProfile, type BrandMatch } from "./brand-view"

export const metadata = { title: "Brand portal — Blackwell" }

export default async function BrandPage() {
  const { supabase, user, who } = await getWho()
  if (!user) redirect("/login")
  if (who?.role === "admin") redirect("/admin")
  // Brands are provisioned by admins; anyone whose email isn't on a brand row
  // belongs in the reviewer flow.
  if (who?.role !== "brand") redirect("/portal")

  const { data: brand } = await supabase.rpc("claim_brand")
  const { data: matches } = await supabase.rpc("my_brand_matches")

  return (
    <main className="min-h-screen w-full bg-[#010101] px-6 py-10 text-[#f8f8f8]">
      <div className="mx-auto w-full max-w-2xl">
        <ConsoleHeader label="Brand" email={who?.email} />
        {brand ? (
          <BrandView
            brand={brand as BrandProfile}
            matches={(matches as BrandMatch[] | null) ?? []}
          />
        ) : (
          <p className="mt-10 text-sm text-[#f8f8f8]/60">
            We couldn&apos;t load your brand. Please sign out and back in, or contact your Blackwell
            admin.
          </p>
        )}
      </div>
    </main>
  )
}
