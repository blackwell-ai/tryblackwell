import React from "react"

// Minimal, dependency-free renderer for the model output we freeze into this page.
// Handles headings, bold, inline code, and unordered/ordered lists.

function inline(text: string, keyBase: string): React.ReactNode[] {
  // split on **bold** and `code`, keep the delimiters' content
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return parts.filter(Boolean).map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return (
        <strong key={`${keyBase}-${i}`} className="font-bold text-[#f4f4f4]">
          {p.slice(2, -2)}
        </strong>
      )
    }
    if (p.startsWith("`") && p.endsWith("`")) {
      return (
        <code
          key={`${keyBase}-${i}`}
          className="rounded bg-[#1a1a1a] px-1 py-0.5 font-[family-name:var(--font-mono)] text-[0.85em] text-[#d7d7d7]"
        >
          {p.slice(1, -1)}
        </code>
      )
    }
    return <React.Fragment key={`${keyBase}-${i}`}>{p}</React.Fragment>
  })
}

export function Markdown({ text }: { text: string }) {
  const lines = (text || "").split("\n")
  const blocks: React.ReactNode[] = []
  let para: string[] = []
  let list: { type: "ul" | "ol"; items: string[] } | null = null
  let k = 0

  const flushPara = () => {
    if (para.length) {
      blocks.push(
        <p key={`p-${k++}`} className="text-[14.5px] leading-relaxed text-[#c4c4c4]">
          {inline(para.join(" "), `p${k}`)}
        </p>
      )
      para = []
    }
  }
  const flushList = () => {
    if (list) {
      const Tag = list.type
      blocks.push(
        <Tag
          key={`l-${k++}`}
          className={`ml-1 space-y-1.5 text-[14.5px] leading-relaxed text-[#c4c4c4] ${
            list.type === "ul" ? "list-disc" : "list-decimal"
          } pl-5 marker:text-[#6f6f6f]`}
        >
          {list.items.map((it, i) => (
            <li key={i}>{inline(it, `li${k}-${i}`)}</li>
          ))}
        </Tag>
      )
      list = null
    }
  }

  for (const raw of lines) {
    const line = raw.trimEnd()
    const heading = line.match(/^(#{1,4})\s+(.*)$/)
    const ul = line.match(/^\s*[-*]\s+(.*)$/)
    const ol = line.match(/^\s*\d+\.\s+(.*)$/)

    if (heading) {
      flushPara()
      flushList()
      const level = heading[1].length
      const cls =
        level <= 2
          ? "mt-5 font-[family-name:var(--font-serif)] text-[15px] font-bold uppercase tracking-[0.04em] text-[#ededed]"
          : "mt-4 font-[family-name:var(--font-mono)] text-[12px] font-bold uppercase tracking-[0.08em] text-[#a7a7a7]"
      blocks.push(
        <p key={`h-${k++}`} className={cls}>
          {inline(heading[2], `h${k}`)}
        </p>
      )
    } else if (ul) {
      flushPara()
      if (!list || list.type !== "ul") {
        flushList()
        list = { type: "ul", items: [] }
      }
      list.items.push(ul[1])
    } else if (ol) {
      flushPara()
      if (!list || list.type !== "ol") {
        flushList()
        list = { type: "ol", items: [] }
      }
      list.items.push(ol[1])
    } else if (line.trim() === "") {
      flushPara()
      flushList()
    } else {
      flushList()
      para.push(line)
    }
  }
  flushPara()
  flushList()

  return <div className="space-y-3">{blocks}</div>
}
