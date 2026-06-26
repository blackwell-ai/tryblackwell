"use client"

import { useState } from "react"

type Mode = "default" | "blackwell"

export default function Demo() {
  const [mode, setMode] = useState<Mode>("default")
  const src = mode === "default" ? "/cgpt/static.html" : "/cgpt/blackwell.html"
  return (
    <div className="fixed inset-0 z-50 bg-[#1c1c1c]">
      <iframe key={mode} src={src} title="ChatGPT" className="h-full w-full border-0" />
      <div className="fixed bottom-6 right-6 z-[60]">
        <div className="flex items-center gap-1 rounded-full border border-[#3a3a3a] bg-[#2a2a2a]/95 p-1 shadow-[0_4px_20px_rgba(0,0,0,0.5)] backdrop-blur">
          {([["default", "ChatGPT today"], ["blackwell", "Powered by Blackwell"]] as const).map(([m, label]) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${
                mode === m ? "bg-white text-[#0d0d0d]" : "text-[#b4b4b4] hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
