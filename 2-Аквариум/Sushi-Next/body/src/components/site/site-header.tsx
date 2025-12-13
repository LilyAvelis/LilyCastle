import Link from "next/link";

import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-semibold tracking-tight">
            Sushi Next
          </Link>
          <span className="hidden rounded-full border border-border/70 bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground sm:inline">
            Next.js • Vercel • Neon • Auth • Drizzle
          </span>
        </div>

        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="#stack">Stack</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="#demo">Demo</Link>
          </Button>
          <ModeToggle />
        </nav>
      </div>
    </header>
  );
}
