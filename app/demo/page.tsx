import type { Metadata } from "next"
import { Markdown } from "./markdown"
import raw from "./demo-data.json"

export const metadata: Metadata = {
  title: "Blackwell — the same model, with and without ground truth",
  description:
    "gpt-5.5 answers the same shopping question twice. The only difference is access to Blackwell's verified, neutrality-scored review corpus.",
}

type Dimension = { name: string; mean_score: number; n_reviews: number }
type Review = { channel: string; is_sponsored: boolean; url: string; sentiment: string }
type Source = {
  product: string
  category: string
  reviews_analyzed: number
  independent: number
  sponsored: number
  dimensions: Dimension[]
  reviews: Review[]
}
type Query = {
  id: string
  title: string
  prompt: string
  baseline: string
  grounded: string
  sources: Source[]
}
const data = raw as unknown as {
  model: string
  totals: { products: number; videos: number }
  queries: Query[]
}

const CAL = "https://cal.com/team/blackwell/30-min"

function ScoreBar({ d }: { d: Dimension }) {
  const pct = ((d.mean_score + 1) / 2) * 100
  const positive = d.mean_score >= 0
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[12px] text-[#b0b0b0]">{d.name}</span>
        <span className="font-[family-name:var(--font-mono)] text-[11px] text-[#7f7f7f]">
          {d.mean_score > 0 ? "+" : ""}
          {d.mean_score.toFixed(2)}
        </span>
      </div>
      <div className="relative h-1 w-full rounded-full bg-[#1c1c1c]">
        {/* centre axis */}
        <div className="absolute left-1/2 top-1/2 h-2 w-px -translate-y-1/2 bg-[#2e2e2e]" />
        <div
          className={`absolute top-0 h-1 rounded-full ${
            positive ? "bg-[#5e8c6a]" : "bg-[#9c5b54]"
          }`}
          style={
            positive
              ? { left: "50%", width: `${pct - 50}%` }
              : { right: "50%", width: `${50 - pct}%` }
          }
        />
      </div>
    </div>
  )
}

function SourcesPanel({ sources }: { sources: Source[] }) {
  return (
    <div className="mt-5 border-t border-[#1d1d1d] pt-4">
      <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.2em] text-[#6f6f6f]">
        Sources it pulled from
      </p>
      <div className="mt-3 space-y-5">
        {sources.map((s) => (
          <div key={s.product}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <span className="text-[13px] font-bold text-[#e8e8e8]">{s.product}</span>
              <span className="font-[family-name:var(--font-mono)] text-[11px] text-[#7f7f7f]">
                {s.reviews_analyzed} reviews · {s.independent} independent ·{" "}
                <span className={s.sponsored ? "text-[#d6a94e]" : ""}>
                  {s.sponsored} sponsored
                </span>
              </span>
            </div>

            {s.dimensions.length ? (
              <div className="mt-3 space-y-2">
                {s.dimensions.map((d) => (
                  <ScoreBar key={d.name} d={d} />
                ))}
              </div>
            ) : null}

            <div className="mt-3 flex flex-wrap gap-1.5">
              {s.reviews.map((r) => (
                <a
                  key={r.url}
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className={`group inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-[family-name:var(--font-mono)] text-[11px] transition-colors ${
                    r.is_sponsored
                      ? "border-[#5c4a23] text-[#d6a94e] hover:border-[#7a6230]"
                      : "border-[#2a2a2a] text-[#b6b6b6] hover:border-[#444] hover:text-[#f2f2f2]"
                  }`}
                >
                  {r.channel}
                  {r.is_sponsored ? (
                    <span className="rounded-sm bg-[#3a2e16] px-1 text-[9px] uppercase tracking-wide text-[#e0b765]">
                      ad
                    </span>
                  ) : null}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Column({
  label,
  caption,
  highlight,
  children,
}: {
  label: string
  caption: string
  highlight?: boolean
  children: React.ReactNode
}) {
  return (
    <div
      className={`flex flex-col rounded-2xl border p-6 sm:p-7 ${
        highlight
          ? "border-[#33402f] bg-[#0b0e0a]"
          : "border-[#1c1c1c] bg-[#0a0a0a]"
      }`}
    >
      <div className="mb-4 flex items-center gap-2.5">
        <span
          className={`h-2 w-2 rounded-full ${
            highlight ? "bg-[#6f9c79]" : "bg-[#3a3a3a]"
          }`}
        />
        <span className="font-[family-name:var(--font-mono)] text-[12px] font-bold uppercase tracking-[0.12em] text-[#e6e6e6]">
          {label}
        </span>
        <span className="font-[family-name:var(--font-mono)] text-[11px] text-[#6f6f6f]">
          {caption}
        </span>
      </div>
      {children}
    </div>
  )
}

export default function Demo() {
  return (
    <main className="relative min-h-screen px-6 pb-28 pt-28 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-6xl">
        {/* hero */}
        <header className="max-w-3xl">
          <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.25em] text-[#7a7a7a]">
            Labs · live demo
          </p>
          <h1 className="mt-6 font-[family-name:var(--font-serif)] text-[clamp(1.8rem,4vw,3.2rem)] uppercase leading-[1.08] tracking-[0.01em]">
            The same model, with and without ground truth
          </h1>
          <p className="mt-7 font-sans text-[15px] leading-relaxed text-[#b6b6b6] sm:text-base">
            Each question below is answered twice by{" "}
            <span className="text-[#ededed]">{data.model}</span>, OpenAI&apos;s
            flagship model. The wording is identical. The only difference is that
            the right-hand answer can call Blackwell&apos;s corpus of verified,
            neutrality-scored product reviews. Both answers are real and unedited,
            generated through the OpenAI API.
          </p>
          <div className="mt-7 flex flex-wrap gap-x-8 gap-y-2 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.12em] text-[#7f7f7f]">
            <span>
              <span className="text-[#cfcfcf]">{data.totals.videos}</span> real
              YouTube reviews
            </span>
            <span>
              <span className="text-[#cfcfcf]">{data.totals.products}</span>{" "}
              products
            </span>
            <span>sponsored reviews flagged with evidence</span>
            <span>every claim links back to its source</span>
          </div>
        </header>

        {/* queries */}
        <div className="mt-16 space-y-20">
          {data.queries.map((q, i) => (
            <section key={q.id}>
              {/* the question */}
              <div className="mb-7 flex items-start gap-4">
                <span className="mt-1 font-[family-name:var(--font-mono)] text-[12px] text-[#5f5f5f]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="max-w-3xl rounded-2xl rounded-tl-sm border border-[#222] bg-[#101010] px-5 py-4">
                  <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.2em] text-[#6f6f6f]">
                    Shopper asks
                  </p>
                  <p className="mt-2 font-sans text-[15px] leading-relaxed text-[#e4e4e4]">
                    {q.prompt}
                  </p>
                </div>
              </div>

              {/* the two answers */}
              <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
                <Column label="ChatGPT today" caption="answers from memory">
                  <Markdown text={q.baseline} />
                </Column>
                <Column
                  label="ChatGPT + Blackwell"
                  caption="answers from the corpus"
                  highlight
                >
                  <Markdown text={q.grounded} />
                  <SourcesPanel sources={q.sources} />
                </Column>
              </div>
            </section>
          ))}
        </div>

        {/* close */}
        <footer className="mt-24 border-t border-[#1c1c1c] pt-10">
          <h2 className="max-w-2xl font-[family-name:var(--font-serif)] text-[clamp(1.3rem,2.4vw,1.9rem)] uppercase leading-[1.12] tracking-[0.01em]">
            The difference is ground truth your model can&apos;t generate on its own
          </h2>
          <p className="mt-5 max-w-2xl font-sans text-[15px] leading-relaxed text-[#b6b6b6]">
            Blackwell builds a neutral, de-faked, neutrality-scored layer of real
            product sentiment that product-discovery systems can pull from. This is
            a seven-product proof of the method, not the full corpus.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <a
              href={CAL}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-[#333] px-5 py-2 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-[#c9c9c9] transition-colors hover:border-[#5a5a5a] hover:text-[#f2f2f2]"
            >
              Book a call
            </a>
            <a
              href="mailto:founders@tryblackwell.com"
              className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-[#7f7f7f] underline underline-offset-4 transition-colors hover:text-[#f2f2f2]"
            >
              founders@tryblackwell.com
            </a>
          </div>
        </footer>
      </div>
    </main>
  )
}
