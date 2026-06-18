// Catalog. Names are the bare article, no descriptors. Ordered by category:
// tops, then layers, then bottoms, then accessory. Images are machine-generated
// spotlit-on-black renders in public/shop/ (see gen-catalog.mjs); swap for real
// photos once samples exist. Prices and copy still to come. Sizes are per product.
export type Product = {
  handle: string
  name: string
  price: number // USD; 0 means "not priced yet" and checkout is blocked
  image?: string
  sizes: string[]
}

const ALPHA = ["XS", "S", "M", "L", "XL", "XXL"]

export const products: Product[] = [
  // tops
  { handle: "tee", name: "Tee", price: 0, image: "/shop/tee.png", sizes: ALPHA },
  { handle: "tank-top", name: "Tank Top", price: 0, image: "/shop/tank-top.png", sizes: ALPHA },
  { handle: "compression-short-sleeve", name: "Compression Short Sleeve", price: 0, image: "/shop/compression-short-sleeve.png", sizes: ALPHA },
  { handle: "compression-long-sleeve", name: "Compression Long Sleeve", price: 0, image: "/shop/compression-long-sleeve.png", sizes: ALPHA },
  { handle: "polo", name: "Polo", price: 0, image: "/shop/polo.png", sizes: ALPHA },
  { handle: "shirt", name: "Shirt", price: 0, image: "/shop/shirt.png", sizes: ALPHA },
  // layers
  { handle: "hoodie", name: "Hoodie", price: 0, image: "/shop/hoodie.png", sizes: ALPHA },
  { handle: "full-zip", name: "Full Zip", price: 0, image: "/shop/full-zip.png", sizes: ALPHA },
  { handle: "sweater", name: "Sweater", price: 0, image: "/shop/sweater.png", sizes: ALPHA },
  // bottoms
  { handle: "pant", name: "Pant", price: 0, image: "/shop/pant.png", sizes: ["S", "M", "L", "XL"] },
  { handle: "denim", name: "Denim", price: 0, image: "/shop/denim.png", sizes: ["28", "30", "32", "34", "36"] },
  // accessory
  { handle: "cap", name: "Cap", price: 0, image: "/shop/cap.png", sizes: ["OS"] },
]
