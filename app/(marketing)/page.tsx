import type { Metadata } from "next"
import { Cta, Eyebrow, Faq, Marquee, PathCard, Step } from "./_components/ui"

export const metadata: Metadata = {
  title: "Blackwell — Get your products recommended by AI",
  description:
    "Generative-engine optimization for brands. Blackwell structures your product data and builds the real reviews AI models trust, then puts you in front of them.",
}

const SURFACES = [
  "ChatGPT",
  "Gemini",
  "Perplexity",
  "Claude",
  "Copilot",
  "AI Overviews",
  "Shopping agents",
]

const FAQ = [
  {
    q: "What is generative-engine optimization?",
    a: "GEO is to AI what SEO was to search. As people ask models what to buy, the brands that win are the ones whose product data is structured for machines and backed by real reviews. Blackwell does both.",
  },
  {
    q: "Do reviewers have to be influencers?",
    a: "No. Our network is everyday people 18 and over. What AI models look for is honest, structured social proof at volume — not follower counts. Real reviews from real users are the point.",
  },
  {
    q: "How do brands pay?",
    a: "A fixed monthly fee for the GEO program — structuring your product data and producing the reviews and video that feed the engines. No per-post pricing.",
  },
  {
    q: "Where do the reviews end up?",
    a: "Today we structure them as the social proof AI weighs when it answers product questions. Long term, we syndicate reviews directly to the platforms people ask — making Blackwell the source of ground truth for what's worth buying.",
  },
]

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative flex min-h-screen flex-col justify-center overflow-hidden px-5 pb-36 pt-32 md:px-10">
        <div className="relative z-10 mx-auto w-full max-w-[1400px]">
          <Eyebrow>Generative engine optimization</Eyebrow>
          <h1 className="mt-6 max-w-[20ch] font-[family-name:var(--font-serif)] text-[clamp(2.6rem,7vw,6rem)] leading-[0.98] tracking-tight">
            Get your products{" "}
            <span className="font-normal italic text-[#f8f8f8]/70">recommended</span> by AI.
          </h1>
          <p className="mt-8 max-w-[56ch] text-lg leading-relaxed text-[#f8f8f8]/60">
            AI is the new storefront. Blackwell structures your product data and builds the real
            reviews models trust — so when someone asks an AI what to buy, the answer is you.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Cta href="/brands">For brands</Cta>
            <Cta href="/reviewers" variant="ghost">
              Become a reviewer
            </Cta>
          </div>
        </div>

        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -bottom-[0.16em] select-none text-center font-[family-name:var(--font-serif)] text-[22vw] font-bold leading-none tracking-tight text-[#0c0c0c]"
        >
          Blackwell
        </span>
      </section>

      {/* MARQUEE */}
      <Marquee items={SURFACES} />

      {/* TWO PATHS */}
      <section className="mx-auto max-w-[1400px] px-5 py-20 md:px-10 md:py-32">
        <div className="mb-14 max-w-[760px]">
          <Eyebrow>Two sides, one engine</Eyebrow>
          <h2 className="mt-4 font-[family-name:var(--font-serif)] text-[clamp(2.25rem,5vw,4rem)] leading-[0.98] tracking-tight">
            Brands get found. <span className="font-normal italic text-[#f8f8f8]/70">People</span>{" "}
            get product.
          </h2>
          <p className="mt-6 max-w-[54ch] text-lg leading-relaxed text-[#f8f8f8]/60">
            A marketplace with the AI buying era built in. Brands fund real reviews; a network of
            everyday reviewers produces them. The result is the social proof models read.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <PathCard
            label="For brands"
            title="Be the answer when"
            titleEm="AI gets asked."
            bullets={[
              "Structured product data models can actually read",
              "Real reviews and video, produced by our network",
              "The social proof AI weighs when it recommends",
              "One fixed monthly fee — no per-post, no guesswork",
            ]}
            ctaHref="/brands"
            ctaLabel="Explore for brands"
          />
          <PathCard
            label="For reviewers"
            title="Free product for an"
            titleEm="honest review."
            bullets={[
              "Get real products, free — keep what we send",
              "No following required; anyone 18+ can join",
              "Your honest take becomes what AI reads",
              "Matched to the categories you actually care about",
            ]}
            ctaHref="/reviewers"
            ctaLabel="Become a reviewer"
          />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="border-t border-[#161616] bg-[#070707] px-5 py-20 md:px-10 md:py-32">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-14 max-w-[760px]">
            <Eyebrow>How it works</Eyebrow>
            <h2 className="mt-4 font-[family-name:var(--font-serif)] text-[clamp(2rem,4vw,3.25rem)] leading-[1] tracking-tight">
              From invisible to{" "}
              <span className="font-normal italic text-[#f8f8f8]/70">recommended</span>.
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            <Step
              n="01"
              title="Audit"
              body="We map how AI currently sees your brand — what it gets right, wrong, and misses entirely."
            />
            <Step
              n="02"
              title="Structure"
              body="We rebuild your product data into clean, machine-readable ground truth models can parse."
            />
            <Step
              n="03"
              title="Review"
              body="Our network receives your product, uses it, and produces structured reviews and video."
            />
            <Step
              n="04"
              title="Surface"
              body="That social proof becomes the signal the engines weigh when they answer what to buy."
            />
          </div>
        </div>
      </section>

      {/* THESIS */}
      <section id="thesis" className="px-5 py-24 md:px-10 md:py-40">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-start gap-12 md:grid-cols-[1fr_1.25fr] md:gap-24">
          <div>
            <Eyebrow>Why Blackwell</Eyebrow>
            <h2 className="mt-6 font-[family-name:var(--font-serif)] text-[clamp(2rem,3.5vw,3rem)] leading-[1] tracking-tight">
              The buying decision is moving{" "}
              <span className="font-normal italic text-[#f8f8f8]/70">inside the model</span>.
            </h2>
            <p className="mt-6 text-base leading-relaxed text-[#f8f8f8]/60">
              People increasingly ask AI what to buy instead of scrolling or searching. Models
              don&apos;t invent trust — they look for structured data and social proof. Most brands
              are invisible to them.
            </p>
            <p className="mt-4 text-base leading-relaxed text-[#f8f8f8]/60">
              We make brands legible to AI, and we build the review layer that feeds it — Reddit-level
              ground truth, with less noise and real incentives, dedicated to what&apos;s worth buying.
            </p>
          </div>

          <blockquote className="relative pl-8 font-[family-name:var(--font-serif)] text-[clamp(1.6rem,3vw,2.6rem)] leading-[1.2] tracking-tight">
            <span aria-hidden className="absolute left-0 top-[0.35em] h-[calc(100%-0.7em)] w-px bg-[#f8f8f8]/40" />
            We&apos;re building the layer of real, incentivized reviews that AI reads —{" "}
            <em className="italic text-[#f8f8f8]/60">the ground truth for what to buy</em>.
          </blockquote>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-5 pb-24 md:px-10">
        <div className="mx-auto max-w-[1000px]">
          <div className="mb-10">
            <Eyebrow>Questions</Eyebrow>
            <h2 className="mt-4 font-[family-name:var(--font-serif)] text-[clamp(1.9rem,4vw,3rem)] leading-[1] tracking-tight">
              The short version.
            </h2>
          </div>
          <Faq items={FAQ} />
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="border-t border-[#161616] px-5 py-24 text-center md:px-10 md:py-32">
        <h2 className="mx-auto max-w-[18ch] font-[family-name:var(--font-serif)] text-[clamp(2.5rem,6vw,5rem)] leading-[0.98] tracking-tight">
          Make your products{" "}
          <span className="font-normal italic text-[#f8f8f8]/70">legible to AI</span>.
        </h2>
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <Cta href="/brands">For brands</Cta>
          <Cta href="/reviewers" variant="ghost">
            Become a reviewer
          </Cta>
        </div>
      </section>
    </>
  )
}
