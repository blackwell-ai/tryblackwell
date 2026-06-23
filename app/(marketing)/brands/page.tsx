import type { Metadata } from "next"
import { Cta, Eyebrow, Faq, Step } from "../_components/ui"

export const metadata: Metadata = {
  title: "For brands — Blackwell",
  description:
    "Generative-engine optimization for brands. We structure your product data and produce the real reviews AI models trust, for one fixed monthly fee.",
}

const FEATURES = [
  {
    title: "Structured product data",
    body: "We rebuild your catalog into clean, machine-readable ground truth — the specs, claims, and context models need to represent you correctly.",
  },
  {
    title: "Real reviews & video",
    body: "Our reviewer network receives your product, actually uses it, and produces structured reviews and video — social proof at volume, not a single sponsored post.",
  },
  {
    title: "Social proof AI trusts",
    body: "Research shows models lean on social proof when they recommend. We make sure yours exists, is structured, and is everywhere the engines look.",
  },
  {
    title: "One fixed monthly fee",
    body: "A flat monthly program — auditing, structuring, and producing the proof that feeds the engines. No per-post pricing, no media-buying games.",
  },
]

const FAQ = [
  {
    q: "What exactly do we pay for?",
    a: "A fixed monthly GEO program: auditing how AI sees you, restructuring your product data, and producing structured reviews and video through our network. One flat fee, not per-post.",
  },
  {
    q: "Do we have to send product to people?",
    a: "Yes — that's how real reviews get made. We handle matching and logistics with our reviewer network. The reviewers don't need to be influencers; honest, structured proof at volume is what matters.",
  },
  {
    q: "How is this different from influencer marketing?",
    a: "Influencer marketing buys reach on social feeds. We build the structured social proof and product data that AI models read when someone asks them what to buy. Different surface, different game.",
  },
  {
    q: "What's the long-term vision?",
    a: "We syndicate reviews to the platforms people ask — the way Bazaarvoice syndicates to retailers, but for LLMs. Blackwell becomes the ground truth for AI product recommendations, and brands work through us to be seen.",
  },
]

export default function BrandsPage() {
  return (
    <>
      {/* HERO */}
      <section className="px-5 pb-16 pt-32 md:px-10 md:pb-24 md:pt-44">
        <div className="mx-auto max-w-[1400px]">
          <Eyebrow>For brands</Eyebrow>
          <h1 className="mt-6 max-w-[16ch] font-[family-name:var(--font-serif)] text-[clamp(2.75rem,8vw,6.5rem)] leading-[0.95] tracking-tight">
            Be the product AI{" "}
            <span className="font-normal italic text-[#f8f8f8]/70">recommends</span>.
          </h1>
          <p className="mt-8 max-w-[54ch] text-lg leading-relaxed text-[#f8f8f8]/60 md:text-xl">
            When buyers ask a model what to get, it answers from structured data and social proof.
            Blackwell builds both for you — and keeps you in front of the engines that are becoming
            the storefront.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Cta href="#contact" arrow="↓">
              Request access
            </Cta>
            <Cta href="/login" variant="ghost">
              Brand sign in
            </Cta>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="border-t border-[#161616] bg-[#070707] px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-14 max-w-[760px]">
            <Eyebrow>The program</Eyebrow>
            <h2 className="mt-4 font-[family-name:var(--font-serif)] text-[clamp(2rem,4vw,3.25rem)] leading-[1] tracking-tight">
              What you&apos;re actually buying.
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-px overflow-hidden border border-[#161616] bg-[#161616] sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-[#070707] p-8 md:p-10">
                <h3 className="font-[family-name:var(--font-serif)] text-xl tracking-tight">
                  {f.title}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-[#f8f8f8]/60">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-14 max-w-[760px]">
            <Eyebrow>How it works</Eyebrow>
            <h2 className="mt-4 font-[family-name:var(--font-serif)] text-[clamp(2rem,4vw,3.25rem)] leading-[1] tracking-tight">
              A standing program, not a campaign.
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            <Step n="01" title="Audit" body="We benchmark how AI represents your brand and products today." />
            <Step n="02" title="Structure" body="We rebuild your product data into machine-readable ground truth." />
            <Step n="03" title="Review" body="We ship product to matched reviewers who produce structured proof." />
            <Step n="04" title="Surface" body="That proof feeds the engines — and we track how your visibility moves." />
          </div>
        </div>
      </section>

      {/* WHAT'S COMING */}
      <section className="border-t border-[#161616] px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-start gap-12 md:grid-cols-[1fr_1.25fr] md:gap-24">
          <div>
            <Eyebrow>What&apos;s coming</Eyebrow>
            <h2 className="mt-6 font-[family-name:var(--font-serif)] text-[clamp(1.9rem,3.5vw,2.75rem)] leading-[1.05] tracking-tight">
              The AI advertising layer.
            </h2>
          </div>
          <div className="space-y-5 text-base leading-relaxed text-[#f8f8f8]/60">
            <p>
              Today we make you legible to AI. Next, we syndicate reviews straight to the platforms
              people ask — the way review networks syndicated to retailers, but for LLMs.
            </p>
            <p>
              As the source of ground truth, Blackwell becomes where brands compete to be
              recommended. Early partners build their review base — and their standing with the
              engines — before that surface gets crowded.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-5 pb-24 md:px-10">
        <div className="mx-auto max-w-[1000px]">
          <div className="mb-10">
            <Eyebrow>Questions</Eyebrow>
            <h2 className="mt-4 font-[family-name:var(--font-serif)] text-[clamp(1.9rem,4vw,3rem)] leading-[1] tracking-tight">
              What you&apos;re probably wondering.
            </h2>
          </div>
          <Faq items={FAQ} />
        </div>
      </section>

      {/* CONTACT CTA */}
      <section id="contact" className="border-t border-[#161616] px-5 py-24 text-center md:px-10 md:py-32">
        <Eyebrow>Request access</Eyebrow>
        <h2 className="mx-auto mt-5 max-w-[20ch] font-[family-name:var(--font-serif)] text-[clamp(2.25rem,5vw,4rem)] leading-[1] tracking-tight">
          Let&apos;s get you in front of the models.
        </h2>
        <p className="mx-auto mt-5 max-w-[46ch] text-base text-[#f8f8f8]/60">
          We onboard brands by hand right now. Tell us about your products and we&apos;ll set up your
          program.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Cta href="mailto:founders@tryblackwell.com?subject=Blackwell%20for%20brands">
            Book a call
          </Cta>
          <Cta href="/login" variant="ghost">
            Brand sign in
          </Cta>
        </div>
      </section>
    </>
  )
}
