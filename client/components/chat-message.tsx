import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
}

export function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div className={cn("flex items-start gap-4 text-sm", message.role === "user" ? "flex-row-reverse" : "")}>
      <Avatar className={cn("h-8 w-8", message.role === "user" ? "bg-violet-600" : "bg-cyan-600")}>
        <AvatarFallback>{message.role === "user" ? "U" : "AI"}</AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "rounded-lg px-4 py-3 max-w-[80%]",
          message.role === "user" ? "bg-violet-600/20 text-white" : "bg-[#0f0f10] text-white border border-[#1a1a1c]",
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        {message.steps && message.steps.length > 0 && (
          <div className="mt-3">
            <StepsDisplay steps={message.steps} />
          </div>
        )}
      </div>
    </div>
  )
}
