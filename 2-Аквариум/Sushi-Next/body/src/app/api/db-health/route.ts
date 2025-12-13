import postgres from "postgres";
import { NextResponse } from "next/server";

export async function GET() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl || databaseUrl.trim() === "") {
    return NextResponse.json(
      {
        connected: false,
        reason: "DATABASE_URL is not set",
        usersTable: false,
      },
      { status: 200 },
    );
  }

  const sql = postgres(databaseUrl, {
    ssl: "require",
    max: 1,
    connect_timeout: 10,
  });

  try {
    await sql`select 1 as ok`;

    const [{ exists }] = await sql<[{ exists: boolean }]>`
      select exists(
        select 1
        from information_schema.tables
        where table_schema = 'public'
          and table_name = 'users'
      ) as exists
    `;

    return NextResponse.json(
      {
        connected: true,
        usersTable: Boolean(exists),
      },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      {
        connected: false,
        reason: err instanceof Error ? err.message : String(err),
        usersTable: false,
      },
      { status: 200 },
    );
  } finally {
    // Close pool to avoid hanging lambdas / dev server.
    await sql.end({ timeout: 5 });
  }
}
