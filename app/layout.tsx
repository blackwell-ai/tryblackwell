import type { Metadata } from "next"
import "./globals.css"
import { DevBar } from "./lib/dev"

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
    <html lang="en">
      <body className="antialiased">
        {children}
        <DevBar />
      </body>
    </html>
  )
}
