export function Hero() {
  return (
    <div className="text-center mb-12 space-y-6">
      <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-[#1a1a1c] bg-[#0f0f10] text-sm text-gray-300 mb-4">
        <span className="w-2 h-2 rounded-full bg-cyan-500 mr-2"></span>
        AI-powered website generation
      </div>
      <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
        What do you want to build?
      </h1>
      <p className="text-lg text-gray-400 max-w-2xl mx-auto">
        Prompt, run, edit, and deploy full-stack <span className="text-white font-medium">web</span> and{" "}
        <span className="text-white font-medium">mobile</span> apps.
      </p>
    </div>
  )
}
