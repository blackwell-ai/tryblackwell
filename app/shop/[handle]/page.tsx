import { notFound } from "next/navigation"
import { products } from "../products"
import ProductDetail from "./ProductDetail"

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params
  const product = products.find((p) => p.handle === handle)
  if (!product) notFound()
  return <ProductDetail product={product} />
}
