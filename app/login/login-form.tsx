"use client"

import { useState } from "react"
import { createSupabaseBrowserClient } from "@/app/lib/supabase/browser"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")
  const [message, setMessage] = useState("")

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
    <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3">
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
        className="rounded-md bg-[#f8f8f8] px-3 py-2 text-sm font-medium text-[#010101] transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {status === "sending" ? "Sending…" : "Send magic link"}
      </button>
      {status === "error" && (
        <p className="text-sm text-red-400">{message || "Something went wrong."}</p>
      )}
    </form>
  )
}
