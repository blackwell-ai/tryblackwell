// Catalog. Names are the bare article, no descriptors. Ordered by category:
// tops, then layers, then bottoms, then accessory. Images are machine-generated
// renders in public/shop/ (see gen-catalog.mjs / gen-models.mjs): `image` front,
// `back` revealed on hover, `model` keyed by fit. Swap for real photos later.
export type Product = {
  handle: string
  name: string
  price: number // USD; 0 means "not priced yet" and checkout is blocked
  image?: string // front view
  back?: string // back view, revealed on hover in the grid
  genders?: string[] // selectable fits, e.g. ["Men","Women"]; absent = unisex
  model?: Record<string, string> // fit label -> on-model image path
  sizes: string[]
}

const ALPHA = ["XS", "S", "M", "L", "XL", "XXL"]
const GENDERED = ["Men", "Women"]
const mm = (h: string) => ({ Men: `/shop/${h}-model-men.png`, Women: `/shop/${h}-model-women.png` })

export const products: Product[] = [
  // tops
  { handle: "tee", name: "Tee", price: 0, image: "/shop/tee.png", back: "/shop/tee-back.png", genders: GENDERED, model: mm("tee"), sizes: ALPHA },
  { handle: "tank-top", name: "Tank Top", price: 0, image: "/shop/tank-top.png", back: "/shop/tank-top-back.png", genders: GENDERED, model: mm("tank-top"), sizes: ALPHA },
  { handle: "compression-short-sleeve", name: "Compression Short", price: 0, image: "/shop/compression-short-sleeve.png", back: "/shop/compression-short-sleeve-back.png", genders: GENDERED, model: mm("compression-short-sleeve"), sizes: ALPHA },
  { handle: "compression-long-sleeve", name: "Compression Long", price: 0, image: "/shop/compression-long-sleeve.png", back: "/shop/compression-long-sleeve-back.png", genders: GENDERED, model: mm("compression-long-sleeve"), sizes: ALPHA },
  { handle: "polo", name: "Polo", price: 0, image: "/shop/polo.png", back: "/shop/polo-back.png", genders: GENDERED, model: mm("polo"), sizes: ALPHA },
  { handle: "long-sleeve-polo", name: "Polo Long", price: 0, image: "/shop/long-sleeve-polo.png", back: "/shop/long-sleeve-polo-back.png", genders: GENDERED, model: mm("long-sleeve-polo"), sizes: ALPHA },
  { handle: "shirt", name: "Shirt", price: 0, image: "/shop/shirt.png", back: "/shop/shirt-back.png", genders: GENDERED, model: mm("shirt"), sizes: ALPHA },
  // layers
  { handle: "hoodie", name: "Hoodie", price: 0, image: "/shop/hoodie.png", back: "/shop/hoodie-back.png", genders: GENDERED, model: mm("hoodie"), sizes: ALPHA },
  { handle: "sweater", name: "Crewneck", price: 0, image: "/shop/sweater.png", back: "/shop/sweater-back.png", genders: GENDERED, model: mm("sweater"), sizes: ALPHA },
  // bottoms
  { handle: "pant", name: "Pant", price: 0, image: "/shop/pant.png", back: "/shop/pant-back.png", genders: GENDERED, model: mm("pant"), sizes: ["S", "M", "L", "XL"] },
  { handle: "denim", name: "Denim", price: 0, image: "/shop/denim.png", back: "/shop/denim-back.png", genders: GENDERED, model: mm("denim"), sizes: ["28", "30", "32", "34", "36"] },
  // accessory
  { handle: "cap", name: "Cap", price: 0, image: "/shop/cap.png", back: "/shop/cap-back.png", model: { Unisex: "/shop/cap-model-unisex.png" }, sizes: ["OS"] },
]
