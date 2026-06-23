import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/app/lib/supabase/server"
import { LoginForm } from "./login-form"

export const metadata = { title: "Sign in — Blackwell" }

export default async function LoginPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) redirect("/dashboard")

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-[#010101] px-6 text-[#f8f8f8]">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-medium tracking-tight">Sign in to Blackwell</h1>
        <p className="mt-2 text-sm text-[#f8f8f8]/60">
          Reviewers, brands, and admins all sign in here. Continue with Google or use your email —
          no password. You&apos;ll be routed to the right place automatically.
        </p>
        <LoginForm />
      </div>
    </main>
  )
}
