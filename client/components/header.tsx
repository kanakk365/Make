import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="w-full backdrop-blur-md sticky top-0 z-50">
      <div className=" mx-auto px-6 flex h-16 items-center justify-between ">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-white">BuildAI</span>
        </Link>
        <Button
          variant="ghost"
          className="text-gray-300 cursor-pointer hover:text-white hover:bg-gray-800/50 transition-colors border-2 border-gray-600 "
        >
          Sign In
        </Button>
      </div>
    </header>
  );
}
