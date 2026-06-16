import { Libre_Baskerville } from "next/font/google"
import LightRays from "@/components/LightRays"

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
})

export default function ComingSoonPage() {
  return (
    <div className="fixed inset-0 h-screen w-screen overflow-hidden bg-[#010101]">
      <div className="absolute inset-0 z-0">
        <LightRays
          raysOrigin="top-center"
          raysColor="#26cb96"
          raysSpeed={0.5}
          lightSpread={0.4}
          rayLength={2}
          followMouse={false}
          pulsating={false}
          noiseAmount={0.05}
          saturation={0.6}
        />
      </div>

      <div
        className={`${libreBaskerville.className} relative z-10 flex h-full w-full flex-col items-center justify-center px-6 text-center`}
      >
        <h1 className="text-6xl font-bold tracking-tight text-[#f8f8f8] md:text-7xl">
          Blackwell
        </h1>
        <p className="mt-6 text-lg text-[#8f8f8f] md:text-xl">Coming soon.</p>
      </div>
    </div>
  )
}
