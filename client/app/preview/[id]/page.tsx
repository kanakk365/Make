import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Github, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function PreviewPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-950">
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back to home</span>
              </Button>
            </Link>
            <h1 className="text-lg font-medium text-white">Preview: {params.id}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2 border-gray-800 bg-gray-900/50 text-white hover:bg-gray-800">
              <Download className="h-4 w-4" />
              Download Code
            </Button>
            <Button variant="outline" className="gap-2 border-gray-800 bg-gray-900/50 text-white hover:bg-gray-800">
              <Github className="h-4 w-4" />
              Push to GitHub
            </Button>
            <Button className="gap-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700">
              <ExternalLink className="h-4 w-4" />
              Deploy
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 container py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden w-full h-[calc(100vh-10rem)]">
          <div className="w-full h-full flex items-center justify-center text-black">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Your Generated Website</h2>
              <p className="text-gray-600 mb-6">This is where the preview of your generated website would appear.</p>
              <p className="text-sm text-gray-500">Preview ID: {params.id}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
