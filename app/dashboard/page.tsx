import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, ArrowRight } from "lucide-react"

export default function DashboardPage() {
  // Sample projects
  const projects = [
    { id: "landing-page", name: "Landing Page", date: "2 days ago" },
    { id: "e-commerce", name: "E-commerce Site", date: "1 week ago" },
    { id: "portfolio", name: "Portfolio", date: "2 weeks ago" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black text-white">
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">
              BuildAI
            </span>
          </Link>
          <Button className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>
      </header>

      <main className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Your Projects</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="bg-gray-900 border-gray-800 text-white">
              <CardHeader>
                <CardTitle>{project.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">Last edited {project.date}</p>
              </CardContent>
              <CardFooter>
                <Link href={`/workspace/${project.id}`} className="w-full">
                  <Button variant="outline" className="w-full border-gray-700 hover:bg-gray-800 hover:text-white">
                    Open Workspace
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
