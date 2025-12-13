# DB Connect Runbook (local + Vercel)

Цель: увидеть, что таблица создана и что проект реально подключается к базе.

## Локально

1) VS Code task: `Sushi Next: Set DATABASE_URL (local)`
   - вставь Neon connection string
   - создастся `body/.env.local`

2) VS Code task: `Sushi Next: DB Push (create tables)`
   - выполнит `npm run db:push`

3) Открой сайт локально и проверь индикатор `DB: ...` на главной.

## Vercel

1) VS Code task: `Sushi Next: Vercel Sync DATABASE_URL`
   - возьмёт `DATABASE_URL` из `body/.env.local`
   - установит его в Vercel для Preview + Production

2) Затем сделай прод деплой: `Sushi Next: Vercel Deploy (Production)`

## Проверка

- `GET /api/db-health` → `{ connected: true, usersTable: true }`
- На главной странице бейдж `DB: connected ✓users`
