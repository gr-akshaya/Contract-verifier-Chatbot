/**
 * Header Component
 *
 * This component provides the main header for the application with:
 * - Core blockchain logo
 * - Application title
 * - Navigation link to home page
 *
 * Features:
 * - Sticky positioning at top of screen
 * - Responsive design
 * - Brand identity with logo and title
 * - Clean, minimal design
 */

import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="py-4 px-6 border-b border-border shadow-md sticky top-0 bg-background z-50">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo and title link */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/Core_logo_light.svg"
            alt="Core Blockchain Logo"
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
