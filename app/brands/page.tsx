import { BrandForm } from "./brand-form"

export default function Brands() {
  return (
    <main className="flex min-h-screen items-center justify-center px-8 py-28 text-center">
      <div className="w-full max-w-md">
        <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.25em] text-[#7a7a7a]">
          For brands
        </p>
        <p className="mt-6 font-sans text-[17px] leading-relaxed text-[#cfcfcf] sm:text-lg">
          Show up when AI recommends a product. We audit your storefront and turn it,
          and its reviews, into the ground truth the engines read.
        </p>
        <BrandForm />
      </div>
    </main>
  )
}
