import Link from "next/link"
import { Libre_Baskerville, Anonymous_Pro } from "next/font/google"

const serif = Libre_Baskerville({ subsets: ["latin"], weight: ["400", "700"] })
const mono = Anonymous_Pro({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-mono" })

export const metadata = { title: "Blackwell", description: "Blackwell" }

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${serif.className} ${mono.variable} min-h-screen bg-[#010101] text-[#f8f8f8]`}>
      <header className="flex items-center justify-between border-b border-[#161616] px-6 py-5 md:px-10">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Blackwell
        </Link>
        <nav className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.25em] text-[#7a7a7a]">
          <Link href="/shop" className="transition-colors hover:text-[#f8f8f8]">
            Shop
          </Link>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  )
}
