import Link from "next/link";
import Image from "next/image";

/** Shared layout for /signin routes — logo-only nav, no auth chrome. */
export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <nav className="relative z-10 px-5 pt-4 pb-3 shrink-0">
        <Link href="/signin" className="flex items-center gap-2 w-fit">
          <Image
            src="/images/logo.svg"
            alt="LookAcross"
            width={20}
            height={20}
            className="dark:invert"
          />
          <span className="font-display text-[18px] font-medium text-foreground">
            LookAcross
          </span>
        </Link>
      </nav>
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
