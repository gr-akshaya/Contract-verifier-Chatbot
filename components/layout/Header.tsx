import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="py-4 px-6 shadow-md sticky top-0 bg-background z-50">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-80">
          <Image
            src="/Core_logo_light.svg"
            alt=""
            width={32}
            height={32}
            className="h-8 w-24 dark:block text-primary"
          />
          <h1 className="text-xl font-headline font-semibold">
            <span className="text-white">Smart Contract Verifier</span>
          </h1>
        </Link>
      </div>
    </header>
  );
}
