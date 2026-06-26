export default function Home() {
  return (
    <main className="relative min-h-screen">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[3fr_2fr]">
        {/* text: full width on mobile, left 60% on desktop */}
        <div className="flex items-center justify-center px-8 pb-16 pt-28 sm:px-14 lg:py-0">
          <div className="w-full max-w-2xl">
            <h1 className="font-[family-name:var(--font-serif)] text-[clamp(2rem,4.6vw,4rem)] uppercase leading-[1.07] tracking-[0.01em]">
              AI needs ground truth to shop
            </h1>

            <p className="mt-7 font-sans text-[15px] leading-relaxed text-[#b3b3b3] sm:text-base">
              AI-driven traffic to online stores is growing 4,700% YoY.
              <sup className="text-[0.6em] text-[#7a7a7a]">1</sup>{" "}
              We believe merchants must make their storefronts legible to machines.
              Blackwell turns product data and social sentiment into ground truth.
            </p>

            {/* narrow screens: the well sits above the rule */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/well.png"
              alt="Blackwell"
              className="mx-auto mt-12 h-auto w-[240px] mix-blend-lighten invert sm:w-[300px] lg:hidden"
            />

            <hr className="mt-10 border-0 border-t border-[#262626]" />

            <div className="mt-4 font-[family-name:var(--font-mono)] text-[11px] leading-relaxed text-[#6f6f6f]">
              <p>
                <span className="text-[#8f8f8f]">1.</span>{" "}
                Adobe. (2025).{" "}
                <span className="italic">
                  Generative AI-powered shopping rises with traffic to U.S. retail sites.
                </span>{" "}
                https://business.adobe.com/blog/generative-ai-powered-shopping-rises-with-traffic-to-retail-sites
              </p>
            </div>
          </div>
        </div>

        {/* desktop: the well in the right 40% */}
        <div className="hidden items-center justify-center px-8 lg:flex">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/well.png"
            alt="Blackwell"
            className="h-auto w-full max-w-[440px] mix-blend-lighten invert"
          />
        </div>
      </div>
    </main>
  )
}
