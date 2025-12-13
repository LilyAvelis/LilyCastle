# Deploy checklist — Vercel (Sushi Next)

Цель: максимально простая последовательность «логин → линк → переменные → деплой».

## 0) Что нужно подготовить (ты можешь “принести” это сюда)

Минимум:

- Доступ к Vercel (любой способ логина: GitHub/Email и т.п.)
- `AUTH_SECRET` — длинная случайная строка

Опционально (для базы/авторизации по-взрослому):

- `DATABASE_URL` из Neon (Postgres)
- `AUTH_GITHUB_ID` и `AUTH_GITHUB_SECRET` (если хочешь GitHub OAuth)

## 1) Логин в Vercel

В VS Code запускай задачу:

- `Sushi Next: Vercel Login`

Она откроет/предложит метод логина.

## 2) Привязка проекта (link)

Запусти:

- `Sushi Next: Vercel Link`

Выбирай:

- **Existing Project** (если уже создан на Vercel) или **New Project**
- Scope (личный аккаунт или team)

После link появится папка `.vercel/` в `body/`.

## 3) Переменные окружения на Vercel

На Vercel (Project → Settings → Environment Variables) добавь:

- `AUTH_SECRET`
- `DATABASE_URL` (если подключаем БД)
- `AUTH_TRUST_HOST=true`

И опционально:

- `AUTH_GITHUB_ID`
- `AUTH_GITHUB_SECRET`

Важно: выставляй для сред:

- Preview + Production (обычно одинаково)

## 4) Preview deploy

Запускай:

- `Sushi Next: Vercel Deploy (Preview)`

Получишь URL вида `*.vercel.app`.

## 5) Production deploy

Запускай:

- `Sushi Next: Vercel Deploy (Production)`

## 6) Быстрая проверка после деплоя

- `/` открывается
- `/api/health` отвечает JSON
- `/api/auth/*` отвечает (Auth роуты доступны)

## Примечание

Сейчас body-проект намеренно имеет простой placeholder UI, чтобы не путать пользователя при повторном разворачивании.
