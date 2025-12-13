"use client";

import { Minus, Plus, RotateCcw } from "lucide-react";

import { useCounterStore } from "@/lib/counter-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CounterCard() {
  const value = useCounterStore((s) => s.value);
  const inc = useCounterStore((s) => s.inc);
  const dec = useCounterStore((s) => s.dec);
  const reset = useCounterStore((s) => s.reset);

  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-base">Zustand counter</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-3">
        <div className="text-3xl font-semibold tabular-nums">{value}</div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="icon" onClick={dec} aria-label="Decrement">
            <Minus className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="icon" onClick={inc} aria-label="Increment">
            <Plus className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={reset} aria-label="Reset">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
