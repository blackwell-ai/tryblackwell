import { Libre_Baskerville } from "next/font/google"

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
})

export default function Home() {
  return (
    <div className="fixed inset-0 h-screen w-screen overflow-hidden bg-[#010101]">
      <div
        className={`${libreBaskerville.className} relative z-10 flex h-full w-full flex-col items-center justify-center px-6 text-center`}
      >
        <h1 className="text-6xl font-bold tracking-tight text-[#f8f8f8] md:text-7xl">
          Blackwell
        </h1>
      </div>
    </div>
  )
}
