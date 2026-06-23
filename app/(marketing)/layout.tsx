import { Libre_Baskerville, Anonymous_Pro } from "next/font/google"
import { Nav } from "./_components/nav"
import { Footer } from "./_components/footer"

const serif = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
})
const mono = Anonymous_Pro({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
})

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${serif.variable} ${mono.variable} min-h-screen bg-[#010101] text-[#f8f8f8]`}>
      <Nav />
      <main id="main">{children}</main>
      <Footer />
    </div>
  )
}
