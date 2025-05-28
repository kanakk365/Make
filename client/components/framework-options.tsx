import Image from "next/image"

export function FrameworkOptions() {
  return (
    <div className="w-full max-w-2xl mx-auto text-center">
      <p className="text-sm text-gray-500 mb-6">or start a blank app with your favorite stack</p>

      <div className="grid grid-cols-4 md:grid-cols-7 gap-8 justify-items-center">
        {/* Row 1 */}
        <FrameworkLogo src="/angular-logo.png" alt="Angular" />
        <FrameworkLogo src="/vue-logo.png" alt="Vue" />
        <FrameworkLogo src="/nextjs-logo.png" alt="Next.js" />
        <FrameworkLogo src="/nuxt-logo.png" alt="Nuxt" />
        <FrameworkLogo src="/generic-space-logo.png" alt="Astro" />
        <FrameworkLogo src="/remix-logo.png" alt="Remix" />
        <FrameworkLogo src="/svelte-logo.png" alt="Svelte" />

        {/* Row 2 */}
        <FrameworkLogo src="/solidjs-logo.png" alt="Solid" />
        <FrameworkLogo src="/react-logo.png" alt="React" />
        <FrameworkLogo src="/typescript-logo.png" alt="TypeScript" />
        <FrameworkLogo src="/react-native-logo.png" alt="React Native" />
        <FrameworkLogo src="/flutter-logo.png" alt="Flutter" />
        <FrameworkLogo src="/qwik-logo.png" alt="Qwik" />
        <FrameworkLogo src="/nodejs-logo.png" alt="Node.js" />
      </div>
    </div>
  )
}

function FrameworkLogo({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="w-10 h-10 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity cursor-pointer bg-[#0f0f10] rounded-lg p-1.5 border border-[#1a1a1c]">
      <Image src={src || "/placeholder.svg"} width={40} height={40} alt={alt} />
    </div>
  )
}
