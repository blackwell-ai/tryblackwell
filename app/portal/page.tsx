import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/app/lib/supabase/server"

export const metadata = { title: "Reviewer portal — Blackwell" }

type Reviewer = {
  id: string
  name: string
  email: string
  social_handles: string | null
  platform: string | null
  followers: string | null
  niches: string[]
  product_interests: string | null
  content_link: string | null
  shipping_address: string | null
  created_at: string
}

function Field({ label, value }: { label: string; value: string | null }) {
  if (!value) return null
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-[#f8f8f8]/40">{label}</dt>
      <dd className="mt-1 text-sm break-words">{value}</dd>
    </div>
  )
}

export default async function PortalPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // claim_reviewer() binds this auth user to their reviewer row (by email) if
  // not already bound, then returns reviewer-safe fields — or null.
  const { data } = await supabase.rpc("claim_reviewer")
  const reviewer = (data as Reviewer | null) ?? null

  return (
    <main className="min-h-screen w-full bg-[#010101] px-6 py-16 text-[#f8f8f8]">
      <div className="mx-auto w-full max-w-xl">
        <header className="flex items-center justify-between">
          <span className="text-sm text-[#f8f8f8]/50">Blackwell · Reviewer portal</span>
          <form action="/auth/signout" method="post">
            <button className="text-sm text-[#f8f8f8]/60 underline-offset-4 hover:underline">
              Sign out
            </button>
          </form>
        </header>

        {reviewer ? (
          <div className="mt-10">
            <h1 className="text-2xl font-medium tracking-tight">{reviewer.name}</h1>
            <p className="mt-1 text-sm text-[#f8f8f8]/60">{reviewer.email}</p>

            {reviewer.niches?.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {reviewer.niches.map((n) => (
                  <span
                    key={n}
                    className="rounded-full border border-[#f8f8f8]/20 px-3 py-1 text-xs text-[#f8f8f8]/80"
                  >
                    {n}
                  </span>
                ))}
              </div>
            )}

            <dl className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Platform" value={reviewer.platform} />
              <Field label="Followers" value={reviewer.followers} />
              <Field label="Social" value={reviewer.social_handles} />
              <Field label="Content" value={reviewer.content_link} />
              <Field label="Product interests" value={reviewer.product_interests} />
              <Field label="Shipping address" value={reviewer.shipping_address} />
            </dl>

            <p className="mt-10 text-xs text-[#f8f8f8]/40">
              Member since {new Date(reviewer.created_at).toLocaleDateString()}
            </p>
          </div>
        ) : (
          <div className="mt-16 text-center">
            <h1 className="text-xl font-medium tracking-tight">You&apos;re signed in</h1>
            <p className="mx-auto mt-3 max-w-sm text-sm text-[#f8f8f8]/60">
              We don&apos;t have a reviewer profile linked to{" "}
              <span className="text-[#f8f8f8]">{user.email}</span> yet. If you applied with a
              different email, sign out and use that one.
            </p>
            <form action="/auth/signout" method="post" className="mt-6">
              <button className="text-sm underline underline-offset-4">Sign out</button>
            </form>
          </div>
        )}
      </div>
    </main>
  )
}
