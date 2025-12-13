"use client";

import useSWR from "swr";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Health = {
  ok: true;
  now: string;
  node: string;
};

const fetcher = async (url: string): Promise<Health> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<Health>;
};

export function HealthCard() {
  const { data, error, isLoading } = useSWR<Health>("/api/health", fetcher, {
    refreshInterval: 15_000,
  });

  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-base">API health</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {isLoading && <p>Checking…</p>}
        {error && <p className="text-destructive">Failed: {String(error.message ?? error)}</p>}
        {data && (
          <div className="space-y-1">
            <p>
              Status: <span className="text-foreground">OK</span>
            </p>
            <p>
              Now: <span className="font-mono text-foreground/80">{data.now}</span>
            </p>
            <p>
              Node: <span className="font-mono text-foreground/80">{data.node}</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
