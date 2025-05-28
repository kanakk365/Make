import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { PromptInput } from "@/components/prompt-input"
import { ImportOptions } from "@/components/import-options"
import { QuickStartTemplates } from "@/components/quick-start-templates"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-[#0a0a0a] text-white">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 max-w-5xl mx-auto w-full">
        <Hero />
        <PromptInput />
        <ImportOptions />
        <QuickStartTemplates />
      </div>
    </main>
  )
}
