import { BrandMark } from "./lib/brand-mark"

export default function Home() {
  return (
    <div className="fixed inset-0 flex h-screen w-screen items-center justify-center overflow-hidden bg-[#010101] text-[#f8f8f8]">
      <BrandMark className="w-20 md:w-24" />
    </div>
  )
}
