"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Paperclip, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"

export function PromptInput() {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const router = useRouter()

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)

    const projectId = `project-${Math.random().toString(36).substring(2, 10)}`

    const encodedMessage = encodeURIComponent(prompt)
    router.push(`/workspace/${projectId}?message=${encodedMessage}`)
    
    setIsGenerating(false)
  }

  return (
    <div className="w-full max-w-2xl mx-auto mb-12">
      <div className="relative">
        <Textarea
          placeholder="How can BuildAI help you today?"
          className="min-h-28 bg-[#0f0f10] border-[#1a1a1c] rounded-xl resize-none text-white placeholder:text-gray-500 focus-visible:ring-violet-500 shadow-lg"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.metaKey) {
              handleGenerate()
            }
          }}
        />
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-white">
            <Paperclip className="h-5 w-5" />
            <span className="sr-only">Attach file</span>
          </Button>
        </div>
        <div className="absolute bottom-3 right-3">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 gap-2 border-0"
          >
            <Sparkles className="h-4 w-4" />
            {isGenerating ? "Generating..." : "Generate"}
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-center mt-3">
        <div className="bg-[#1a1a1c] rounded-md px-2 py-1 text-xs text-gray-400">Press ⌘ + Enter to generate</div>
      </div>
    </div>
  )
}
