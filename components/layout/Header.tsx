import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="py-6 px-6 h-[88px] backdrop-blur-[40px] shadow-md sticky top-0">
      <div className="container mx-auto flex items-center justify-between relative">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/Core_logo_light.svg"
            alt=""
            width={32}
            height={32}
            className="h-8 w-24 dark:block text-primary"
          />
        </Link>

        <h1 className="absolute left-1/2 transform -translate-x-1/2 text-base font-semibold font-lexend items-center">
          <span className="text-white">Smart Contract Verifier</span>
        </h1>
      </div>
    </header>
  );
}
