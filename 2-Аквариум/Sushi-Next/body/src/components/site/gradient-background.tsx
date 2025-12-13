import * as React from "react";

export function GradientBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={
        "pointer-events-none absolute inset-0 overflow-hidden " +
        (className ?? "")
      }
    >
      <div className="absolute -top-40 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-violet-500/35 via-fuchsia-500/25 to-cyan-400/25 blur-3xl" />
      <div className="absolute bottom-[-18rem] right-[-10rem] h-[34rem] w-[34rem] rounded-full bg-gradient-to-tr from-emerald-400/25 via-sky-400/20 to-amber-400/25 blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.35),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.10),rgba(0,0,0,0))]" />
      <div className="absolute inset-0 [background-image:linear-gradient(to_right,rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.04)_1px,transparent_1px)] dark:[background-image:linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_55%,transparent_75%)]" />
    </div>
  );
}
