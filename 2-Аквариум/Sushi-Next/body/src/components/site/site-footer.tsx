export function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          Built for one-click deploy dreams. <span className="text-foreground/70">Sushi Next</span>
        </p>
        <p className="text-xs">
          Tip: add your <span className="font-mono">DATABASE_URL</span> + auth secrets in <span className="font-mono">.env</span>.
        </p>
      </div>
    </footer>
  );
}
