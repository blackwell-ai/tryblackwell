import type { Metadata } from "next"
import { Cta, Eyebrow, Faq, Step } from "../_components/ui"

export const metadata: Metadata = {
  title: "For reviewers — Blackwell",
  description:
    "Get real products for free and review them honestly. No following required — anyone 18+ can join. Your reviews shape what AI recommends.",
}

const FEATURES = [
  {
    title: "Free products, yours to keep",
    body: "Brands send real product at no cost. You use it, you keep it. The only thing we ask for in return is your honest review.",
  },
  {
    title: "No following required",
    body: "You don't need to be an influencer or have any audience. If you're 18 or over and you'll give a real opinion, you can join.",
  },
  {
    title: "Your review shapes AI",
    body: "Honest, structured reviews are what AI models read when people ask them what to buy. Your take becomes part of the ground truth.",
  },
  {
    title: "Matched to your interests",
    body: "Tell us the categories you care about and we match you with products that fit — not random PR-box spam.",
  },
]

const FAQ = [
  {
    q: "Do I need a following or to be an influencer?",
    a: "No. Anyone 18 or over can join. We care about honest, useful reviews — not follower counts. Real opinions from real people are exactly the point.",
  },
  {
    q: "Do I have to pay for anything?",
    a: "Never. Products ship to you free and are yours to keep. Blackwell is paid by brands, not reviewers.",
  },
  {
    q: "What do I have to do?",
    a: "Use the product and leave an honest, structured review — and short video when it fits. That's it. Your genuine experience is what makes the network valuable.",
  },
  {
    q: "Is there an application?",
    a: "No. Sign up with Google, confirm you're 18 or older, and you're in. Add your interests and shipping details whenever you like so we can match you well.",
  },
  {
    q: "How do I get matched?",
    a: "Once you've added the categories you care about, we pair you with brands whose products fit. For now our team curates matches by hand.",
  },
]

export default function ReviewersPage() {
  return (
    <>
      {/* HERO */}
      <section className="px-5 pb-16 pt-32 md:px-10 md:pb-24 md:pt-44">
        <div className="mx-auto max-w-[1400px]">
          <Eyebrow>For reviewers</Eyebrow>
          <h1 className="mt-6 max-w-[15ch] font-[family-name:var(--font-serif)] text-[clamp(2.75rem,8vw,6.5rem)] leading-[0.95] tracking-tight">
            Free product for an{" "}
            <span className="font-normal italic text-[#f8f8f8]/70">honest</span> review.
          </h1>
          <p className="mt-8 max-w-[52ch] text-lg leading-relaxed text-[#f8f8f8]/60 md:text-xl">
            Sign up in seconds with Google — no application. Get real products for free, share what
            you actually think, and help decide what AI recommends to everyone else. No following
            needed — just be 18 or older.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Cta href="/login">Sign up free</Cta>
            <Cta href="#how" variant="ghost" arrow="↓">
              How it works
            </Cta>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="border-t border-[#161616] bg-[#070707] px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-14 max-w-[760px]">
            <Eyebrow>Why join</Eyebrow>
            <h2 className="mt-4 font-[family-name:var(--font-serif)] text-[clamp(2rem,4vw,3.25rem)] leading-[1] tracking-tight">
              Real product. Real opinions.
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
      <section id="how" className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-14 max-w-[760px]">
            <Eyebrow>How it works</Eyebrow>
            <h2 className="mt-4 font-[family-name:var(--font-serif)] text-[clamp(2rem,4vw,3.25rem)] leading-[1] tracking-tight">
              Four steps to free product.
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            <Step n="01" title="Sign up" body="Continue with Google and confirm you're 18+. No application, no password." />
            <Step n="02" title="Add interests" body="Tell us the categories you like and where to ship — anytime, takes a minute." />
            <Step n="03" title="Receive product" body="It ships to you free and it's yours to keep, no strings attached." />
            <Step n="04" title="Review" body="Use it and leave an honest, structured review. That's what powers the network." />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-[#161616] px-5 py-20 md:px-10 md:pb-24">
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

      {/* CTA */}
      <section className="border-t border-[#161616] px-5 py-24 text-center md:px-10 md:py-32">
        <h2 className="mx-auto max-w-[18ch] font-[family-name:var(--font-serif)] text-[clamp(2.5rem,6vw,5rem)] leading-[0.98] tracking-tight">
          Get products. Shape{" "}
          <span className="font-normal italic text-[#f8f8f8]/70">what AI knows</span>.
        </h2>
        <p className="mx-auto mt-5 max-w-[42ch] text-base text-[#f8f8f8]/60">
          Sign up with Google in seconds. We&apos;ll match you when a product fits.
        </p>
        <div className="mt-10 flex justify-center">
          <Cta href="/login">Sign up free</Cta>
        </div>
      </section>
    </>
  )
}
