import { Button } from "@/components/ui/button"

export function QuickStartTemplates() {
  const templates = [
    "Build a mobile app with Expo",
    "Start a blog with Astro",
    "Create a docs site with Vitepress",
    "Scaffold UI with shadcn",
    "Draft a presentation with Slidev",
  ]

  return (
    <div className="w-full max-w-2xl mx-auto mb-12">
      <div className="flex flex-wrap justify-center gap-2">
        {templates.map((template, index) => (
          <Button
            key={index}
            variant="outline"
            className="border-[#1a1a1c] bg-[#0f0f10] text-white hover:bg-[#1a1a1c] hover:text-white text-sm"
          >
            {template}
          </Button>
        ))}
      </div>
    </div>
  )
}
