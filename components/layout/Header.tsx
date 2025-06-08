import Link from "next/link";
import { ThemeToggleButton } from "./ThemeToggleButton";
import Image from "next/image";

export default function Header() {
  return (
    <header className="py-4 px-6 border-b border-border shadow-md sticky top-0 bg-background z-50">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/dark.png"
            alt=""
            width={32}
            height={32}
            className="h-8 w-24 hidden dark:block text-primary"
          />
          <Image
            src="/light.png"
            alt=""
            width={32}
            height={32}
            className="h-8 w-24 dark:hidden block text-primary"
          />
          <h1 className="text-2xl font-headline font-semibold text-foreground">
            Smart Contract Verifier
          </h1>
        </Link>
        <ThemeToggleButton />
      </div>
    </header>
  );
}
