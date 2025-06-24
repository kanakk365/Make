import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function Header() {
  return (
    <header className="w-full backdrop-blur-md sticky top-0 z-50">
      <div className=" mx-auto px-6 flex h-16 items-center justify-between ">
        <Link href="/" className="flex items-center gap-3">
          <span className="text-2xl font-bold text-white">Doc.ai</span>
          
        </Link>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="text-gray-300 cursor-pointer hover:text-white hover:bg-gray-800/50 transition-colors border-2 border-gray-600 "
            >
              Sign In
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-[#0a0a0a] border-gray-800 [&>button]:text-gray-400 [&>button]:hover:text-white [&>button]:hover:bg-gray-800">
            <DialogHeader>
              <DialogTitle className="text-white">Oops! 🙈</DialogTitle>
              <DialogDescription className="text-center py-4 text-gray-300">
                I&apos;m busy and lazy... both will implement it later! 😅
                <br />
                <span className="text-sm text-gray-400 mt-2 block">
                  You can use it without this 
                </span>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}
