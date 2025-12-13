"use client";

import useSWR from "swr";

import { Badge } from "@/components/ui/badge";

type DbHealth =
  | { connected: true; usersTable: boolean }
  | { connected: false; usersTable: false; reason?: string };

const fetcher = async (url: string): Promise<DbHealth> => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<DbHealth>;
};

export function DbStatusPill() {
  const { data, error, isLoading } = useSWR<DbHealth>("/api/db-health", fetcher, {
    refreshInterval: 15_000,
    revalidateOnFocus: true,
  });

  if (isLoading) return <Badge variant="secondary">DB: checking…</Badge>;
  if (error) return <Badge variant="destructive">DB: error</Badge>;
  if (!data) return <Badge variant="secondary">DB: unknown</Badge>;

  if (!data.connected) {
    return (
      <Badge variant="secondary" title={data.reason ?? "Not connected"}>
        DB: disconnected
      </Badge>
    );
  }

  return (
    <Badge variant="default" title={data.usersTable ? "users table present" : "users table missing"}>
      DB: connected{data.usersTable ? " ✓users" : " (no users)"}
    </Badge>
  );
}
