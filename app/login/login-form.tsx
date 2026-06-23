"use client"

import { useState } from "react"
import { createSupabaseBrowserClient } from "@/app/lib/supabase/browser"

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.24 1.4-1.66 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.4 14.6 2.5 12 2.5 6.8 2.5 2.6 6.7 2.6 12S6.8 21.5 12 21.5c5.4 0 9-3.8 9-9.1 0-.6-.06-1.1-.15-1.6H12z"
      />
    </svg>
  )
}

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "google" | "sending" | "sent" | "error">("idle")
  const [message, setMessage] = useState("")

  async function signInGoogle() {
    setStatus("google")
    setMessage("")
    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    // On success the browser redirects to Google; we only land here on error.
    if (error) {
      setStatus("error")
      setMessage(error.message)
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("sending")
    setMessage("")
    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      setStatus("error")
      setMessage(error.message)
    } else {
      setStatus("sent")
    }
  }

  if (status === "sent") {
    return (
      <div className="mt-6 rounded-md border border-[#f8f8f8]/15 p-4 text-sm">
        Check <span className="font-medium">{email}</span> for a sign-in link.
      </div>
    )
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={signInGoogle}
        disabled={status === "google"}
        className="flex w-full items-center justify-center gap-2.5 rounded-md bg-[#f8f8f8] px-3 py-2.5 text-sm font-medium text-[#010101] transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        <GoogleMark />
        {status === "google" ? "Redirecting…" : "Continue with Google"}
      </button>

      <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-[#f8f8f8]/30">
        <span className="h-px flex-1 bg-[#f8f8f8]/15" />
        or
        <span className="h-px flex-1 bg-[#f8f8f8]/15" />
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-[#f8f8f8]/20 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-[#f8f8f8]/30 focus:border-[#f8f8f8]/50"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="rounded-md border border-[#f8f8f8]/30 px-3 py-2 text-sm font-medium text-[#f8f8f8] transition-colors hover:bg-[#f8f8f8]/5 disabled:opacity-50"
        >
          {status === "sending" ? "Sending…" : "Email me a magic link"}
        </button>
      </form>

      {status === "error" && (
        <p className="mt-3 text-sm text-red-400">{message || "Something went wrong."}</p>
      )}
    </div>
  )
}
