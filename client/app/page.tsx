import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { PromptInput } from "@/components/ui/prompt-input";
import { GridBackground } from "@/components/grid-background";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col bg-[#0a0a0a] text-white">
      <GridBackground />
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-24  max-w-5xl mx-auto w-full relative z-10">
        <Hero />
        <PromptInput />
      </div>
    </main>
  );
}
