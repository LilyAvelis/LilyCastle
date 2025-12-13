# @Out-Chef-1 — Sushi-Next (Checkpoint 1)

Дата: 2025-12-13

## Заземление: текущая структура

Сейчас в `2-Аквариум/Sushi-Next/` лежит «триада» (как и ты предложила):

- `@O/` — документация проекта (мыслеформы, планы, чекпоинты)
- `body/` — **body**: реальный Next.js-проект
- `Cli/` — **ещё не создано** (планируется как отдельная папка для управления/оркестрации)

Документация-источник по стеку уже есть: `@O/@Home`.

## Что уже сделано (сборка “рыбы”)

### 1) Реально создан Next.js проект
Создан полноценный проект App Router + TypeScript + Tailwind:

- Путь: `2-Аквариум/Sushi-Next/body/`
- Версии (на момент чекпоинта):
  - `next@16.0.10`
  - `react@19.2.1`
  - `tailwindcss@^4`

### 2) Поднят shadcn/ui и базовые компоненты
Инициализирован shadcn (создан `components.json`, `src/lib/utils.ts`, обновлены CSS variables в `src/app/globals.css`).
Добавлены компоненты:

- `button`, `card`, `badge`, `input`, `separator`, `tabs`, `dropdown-menu`, `sheet`, `navigation-menu`, `avatar`, `sonner`

### 3) “Сексуальность”: базовый landing + стеклянный фон
Заменён дефолтный стартовый экран Next на более «витринный» лендинг:

- `src/app/layout.tsx` — добавлены:
  - `ThemeProvider` (next-themes)
  - `SiteHeader` / `SiteFooter`
  - `Toaster` (sonner)
- `src/app/page.tsx` — лендинг с:
  - hero-секцией
  - карточками Stack
  - блоком Demo
  - блоком “Одна кнопка в VS Code”
- UI-утилиты:
  - `src/components/site/gradient-background.tsx` — градиенты/сетка/blur
  - `src/components/site/site-header.tsx`, `site-footer.tsx`
  - `src/components/mode-toggle.tsx` — переключение темы

Плюс небольшие полировки в `src/app/globals.css` (smooth scroll и selection).

### 4) Plumbing-доказательства: SWR + Zustand
Чтобы проект был не только “красивый”, но и “живой”:

- SWR demo:
  - `src/app/api/health/route.ts` — health endpoint
  - `src/components/demo/health-card.tsx` — карточка с SWR polling
- Zustand demo:
  - `src/lib/counter-store.ts`
  - `src/components/demo/counter-card.tsx`

### 5) Скелет Auth.js (NextAuth v5 beta) + API handlers
Подключён Auth.js / NextAuth v5:

- `next-auth@5.0.0-beta.30`
- `src/auth.ts` — конфиг Auth:
  - GitHub provider (если заданы переменные)
  - Dev Credentials provider для локального запуска без OAuth (пароль: `sushi`, только не для продакшна)
- `src/app/api/auth/[...nextauth]/route.ts` — handlers

### 6) Скелет Drizzle + конфиг + пример схемы
Добавлен минимальный слой БД:

- `drizzle.config.ts` — конфиг drizzle-kit (через dotenv)
- `src/db/schema.ts` — пример таблицы `users`
- `src/db/index.ts` — подключение к Postgres (Neon) через `postgres` + `drizzle-orm`
  - если `DATABASE_URL` не задан — DB отключается (UI всё равно стартует)

В `package.json` добавлены скрипты:

- `db:generate`
- `db:migrate`
- `db:push`
- `db:studio`

### 7) Переменные окружения добавлены (плейсхолдеры)
Созданы:

- `body/.env` — плейсхолдеры
- `body/.env.example` — шаблон

Ключевые поля:

- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_TRUST_HOST`
- `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` (опционально)

### 8) “Одна кнопка”: задачи VS Code + Windows scripts
Добавлены windows-скрипты:

- `body/scripts/setup_windows.ps1` — создает `.env` из `.env.example` при необходимости и делает `npm install`
- `body/scripts/run_dev.ps1` — запускает `npm run dev`

И добавлены задачи в workspace:

- `.vscode/tasks.json`
  - `Sushi Next: Setup (Windows)`
  - `Sushi Next: Dev Server`
  - `Sushi Next: Open in Browser`

## Нюансы / риски (важно зафиксировать)

- `next-auth` сейчас на **beta v5** (это ок для App Router; но beta есть beta).
- В dev включён Credentials provider (пароль `sushi`) — это “bootstrap” для быстрого старта UI. В продакшне убрать.
- `npm install` показывал “4 moderate severity vulnerabilities” (по npm audit). Пока не фиксили принудительно.

## Следующий логический шаг: выделить Cli (управление)

Идея правильная: отдельно `Cli/` рядом с `@O` и `body`.

**Предварительная роль Cli:**

- `cli setup` → install deps / check env
- `cli dev` → поднять dev server
- `cli open` → открыть браузер
- `cli db push|studio` → обвязка вокруг drizzle-kit
- возможно: `cli vercel` → деплой

Пока Cli **не создавали**, но инфраструктура уже готова (скрипты + VS Code tasks — прототип “одной кнопки”).

## Примечание для будущего чекпоинта

Чтобы закрыть «первую волну» полностью, нужно:

- прогнать `npm run build` в `body/`
- решить audit-уязвимости (аккуратно, без ломания зависимостей)
- добавить короткий `@O/@ReadMe.md` (как вход в доки), если захочется

---

## Дополнение (2025-12-13): DB поток и «одна кнопка»

### Что сломалось и почему

1) **`scripts/set_database_url.ps1` падал синтаксически**

Причина: в PowerShell нельзя экранировать кавычки через `\"` как в JS. PowerShell-экранирование — это backtick: `` `" ``.
Из-за этого задача **“Sushi Next: Set DATABASE_URL (local)”** могла падать ещё до записи `.env.local`.

2) **`db:push` ходил в `HOST` вместо Neon**

Это выглядело так: `getaddrinfo ENOTFOUND HOST`.
Причина: `drizzle.config.ts` загружал `.env.local`, но dotenv мог ничего не «внедрить», если значение `DATABASE_URL` уже было в окружении (например, плейсхолдер). Тогда Drizzle использовал плейсхолдерный `DATABASE_URL`.

### Что сделано (фикс)

- `body/scripts/set_database_url.ps1` исправлен: корректное экранирование и запись строки вида `DATABASE_URL="..."`.
- `body/drizzle.config.ts` исправлен: теперь загружается `.env` → затем `.env.local` с `override: true`, чтобы `.env.local` **всегда побеждал**.

### Рабочий «лёгкий» поток

1) VS Code task: **Sushi Next: Set DATABASE_URL (local)** → пишет `body/.env.local`
2) `npm run db:push` → создаёт таблицы (например, `users`)
3) VS Code task: **Sushi Next: Vercel Sync DATABASE_URL** → обновляет переменную в Vercel
4) `npm run vercel:deploy:prod` → чтобы переменная точно применилась

После этого индикатор на главной странице должен показывать, что DB подключена, а таблица `users` найдена.
