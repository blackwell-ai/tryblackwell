import type { Metadata } from "next"
import { Libre_Baskerville, Anonymous_Pro } from "next/font/google"
import "./globals.css"
import { Nav } from "./lib/nav"

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

export const metadata: Metadata = {
  title: "Blackwell",
  description: "Blackwell",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${serif.variable} ${mono.variable}`}>
      <body className="antialiased">
        <Nav />
        {children}
      </body>
    </html>
  )
}
