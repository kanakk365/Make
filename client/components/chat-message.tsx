import { cn } from "@/lib/utils"
import { Step } from "@/lib/types"
import { StepsDisplay } from "./steps-display"

interface ChatMessageProps {
  message: {
    id: string
    role: "user" | "assistant"
    content: string
    steps?: Step[]
  }
  templateSteps?: Step[]
  generationSteps?: Step[]
  currentPhase?: "template" | "generation" | "complete" | null
}

export function ChatMessage({ message, templateSteps = [], generationSteps = [], currentPhase = null }: ChatMessageProps) {
  return (
    <div className={cn("flex items-start gap-4", message.role === "user" ? "flex-row-reverse" : "")}>
      <div
        className={cn(
          "rounded-xl px-4 py-3 max-w-[80%] text-sm",
          message.role === "user" 
            ? "bg-white text-black" 
            : "bg-[#0f0f10] text-white border border-gray-800",
        )}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
        {(message.steps && message.steps.length > 0) || (currentPhase && currentPhase !== "complete" && (templateSteps.length > 0 || generationSteps.length > 0)) ? (
          <div className="mt-4">
            <StepsDisplay 
              steps={message.steps || []} 
              templateSteps={templateSteps}
              generationSteps={generationSteps}
              currentPhase={currentPhase}
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}
