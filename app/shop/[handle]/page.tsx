import { notFound } from "next/navigation"
import { products } from "../products"
import Buy from "./Buy"

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params
  const product = products.find((p) => p.handle === handle)
  if (!product) notFound()

  return (
    <section className="grid grid-cols-1 md:grid-cols-2">
      <div className="relative flex aspect-square items-center justify-center border-b border-[#161616] bg-[radial-gradient(circle_at_50%_40%,#1d1d1d,#050505_72%)] md:aspect-auto md:min-h-[82vh] md:border-b-0 md:border-r">
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <span className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.35em] text-[#3a3a3a]">
            image
          </span>
        )}
      </div>
      <div className="px-6 py-12 md:px-12 md:py-20">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{product.name}</h1>
        <p className="mt-3 font-[family-name:var(--font-mono)] text-sm tracking-[0.2em] text-[#7a7a7a]">
          {product.price ? `$${product.price}` : "NOT PRICED YET"}
        </p>
        <Buy product={product} />
      </div>
    </section>
  )
}
