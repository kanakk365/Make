import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // This is a placeholder for actual AI integration
    // In a real app, you would use the AI SDK to generate the website
    // const { text } = await generateText({
    //   model: openai("gpt-4o"),
    //   prompt: `Generate a website based on this description: ${prompt}`,
    // });

    // For now, we'll just simulate a response
    const mockResponse = {
      id: "gen_" + Math.random().toString(36).substring(2, 15),
      preview: "/preview/mock-preview",
      html: "<div>Mock generated website</div>",
      css: "body { font-family: sans-serif; }",
      js: "console.log('Hello world');",
    }

    return NextResponse.json(mockResponse)
  } catch (error) {
    console.error("Error generating website:", error)
    return NextResponse.json({ error: "Failed to generate website" }, { status: 500 })
  }
}
