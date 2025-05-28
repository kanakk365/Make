import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Github, Twitter, Linkedin } from "lucide-react"

export function Header() {
  return (
    <header className="w-full border-b border-[#1a1a1c] bg-[#0f0f10]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent">
            BuildAI
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Link href="https://github.com" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Button>
            </Link>
            <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Button>
            </Link>
            <Link href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Button>
            </Link>
          </div>
          <Button variant="ghost" className="text-gray-400 hover:text-white">
            Sign In
          </Button>
          <Button className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 border-0">
            Get Started
          </Button>
        </div>
      </div>
    </header>
  )
}
