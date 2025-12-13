import Link from "next/link";

import { CounterCard } from "@/components/demo/counter-card";
import { DbStatusPill } from "@/components/demo/db-status-pill";
import { HealthCard } from "@/components/demo/health-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:py-16">
      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-semibold tracking-tight">Sushi Next (placeholder)</h1>
          <DbStatusPill />
        </div>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Этот экран намеренно простой: это базовая точка входа, чтобы при разворачивании «рыбы» в новом месте
          не возникало ощущения готового продукта и лишней путаницы.
        </p>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild>
            <Link href="#getting-started">Getting started</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="#demo">Demo plumbing</Link>
          </Button>
        </div>
      </section>

      <section id="getting-started" className="mt-10 scroll-mt-24">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Getting started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Документация проекта живёт в <span className="font-mono text-foreground">../@O</span>.
            </p>
            <Separator />
            <div className="space-y-2">
              <p>
                В VS Code доступны задачи:
                <span className="ml-2 font-mono text-foreground">Sushi Next: Setup (Windows)</span>,
                <span className="ml-2 font-mono text-foreground">Sushi Next: Dev Server</span>,
                <span className="ml-2 font-mono text-foreground">Sushi Next: Open in Browser</span>.
              </p>
              <p>
                Переменные окружения: <span className="font-mono text-foreground">.env</span> (есть плейсхолдеры).
              </p>
              <p>
                Dev-auth (только для разработки): пароль <span className="font-mono text-foreground">sushi</span>.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section id="demo" className="mt-10 scroll-mt-24">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">Demo plumbing</h2>
          <p className="text-sm text-muted-foreground">
            Мини-демо, чтобы проверить, что SWR/Zustand и API routes живые.
          </p>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <HealthCard />
          <CounterCard />
        </div>
      </section>
    </div>
  );
}
