// Catalog. Names are the bare article, no descriptors. Ordered by category:
// tops, then layers, then bottoms, then accessory. Images are machine-generated
// renders in public/shop/ (see gen-catalog.mjs); `image` is the front, `back` is
// shown on hover. Swap for real photos once samples exist. Sizes are per product.
export type Product = {
  handle: string
  name: string
  price: number // USD; 0 means "not priced yet" and checkout is blocked
  image?: string // front view
  back?: string // back view, revealed on hover
  sizes: string[]
}

const ALPHA = ["XS", "S", "M", "L", "XL", "XXL"]

export const products: Product[] = [
  // tops
  { handle: "tee", name: "Tee", price: 0, image: "/shop/tee.png", back: "/shop/tee-back.png", sizes: ALPHA },
  { handle: "tank-top", name: "Tank Top", price: 0, image: "/shop/tank-top.png", back: "/shop/tank-top-back.png", sizes: ALPHA },
  { handle: "compression-short-sleeve", name: "Compression Short Sleeve", price: 0, image: "/shop/compression-short-sleeve.png", back: "/shop/compression-short-sleeve-back.png", sizes: ALPHA },
  { handle: "compression-long-sleeve", name: "Compression Long Sleeve", price: 0, image: "/shop/compression-long-sleeve.png", back: "/shop/compression-long-sleeve-back.png", sizes: ALPHA },
  { handle: "polo", name: "Polo", price: 0, image: "/shop/polo.png", back: "/shop/polo-back.png", sizes: ALPHA },
  { handle: "shirt", name: "Shirt", price: 0, image: "/shop/shirt.png", back: "/shop/shirt-back.png", sizes: ALPHA },
  // layers
  { handle: "hoodie", name: "Hoodie", price: 0, image: "/shop/hoodie.png", back: "/shop/hoodie-back.png", sizes: ALPHA },
  { handle: "full-zip", name: "Full Zip", price: 0, image: "/shop/full-zip.png", back: "/shop/full-zip-back.png", sizes: ALPHA },
  { handle: "sweater", name: "Sweater", price: 0, image: "/shop/sweater.png", back: "/shop/sweater-back.png", sizes: ALPHA },
  // bottoms
  { handle: "pant", name: "Pant", price: 0, image: "/shop/pant.png", back: "/shop/pant-back.png", sizes: ["S", "M", "L", "XL"] },
  { handle: "denim", name: "Denim", price: 0, image: "/shop/denim.png", back: "/shop/denim-back.png", sizes: ["28", "30", "32", "34", "36"] },
  // accessory
  { handle: "cap", name: "Cap", price: 0, image: "/shop/cap.png", back: "/shop/cap-back.png", sizes: ["OS"] },
]
