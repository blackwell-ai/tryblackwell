import { EvaluatorForm } from "./evaluator-form"

export default function Evaluators() {
  return (
    <main className="flex min-h-screen items-center justify-center px-8 py-28">
      <div className="w-full max-w-md text-center">
        <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.25em] text-[#7a7a7a]">
          For evaluators
        </p>
        <p className="mt-6 font-sans text-[17px] leading-relaxed text-[#cfcfcf] sm:text-lg">
          Review and keep real products. Your honest takes inform how AI shops.
        </p>
        <EvaluatorForm />
      </div>
    </main>
  )
}
