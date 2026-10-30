# Fanboard

Спортивное (футбольное) веб-приложение для фанатов: пользователь выбирает
любимую команду и получает персонализированную информацию о ней — матчи,
турнирную таблицу, состав, ближайшие игры.

## Статус проекта

MVP в разработке. Проект отскаффолжен через `create-vue` (Vue 3 + TypeScript +
Vite, Router, Pinia, Vitest, ESLint/oxlint + Prettier), подключены Tailwind CSS v4
и Reka UI. Все 5 экранов MVP готовы, приложение задеплоено на Cloudflare Workers:
https://fanboard.vadiminsk90.workers.dev

Разделение работы:
- **Логику пишет пользователь** (`<script setup>`, services, types, stores,
  composables, router, конфиги): Claude даёт пошаговые инструкции, но этот код
  за него не пишет.
- **Разметку и стили пишет Claude** (`<template>` и Tailwind-классы в `.vue`):
  пользователь стилями не занимается. Claude связывает шаблон с переменными и
  функциями, которые пользователь объявил в `<script setup>`, и не меняет их.

## Концепция MVP

Только футбол. Данные — реальное внешнее API (football-data.org), без своего
бэкенда. Выбор команды хранится на клиенте (localStorage), авторизации нет.

### Экраны

1. **Выбор команды** — список лиг → команд из API, поиск.
2. **Дашборд команды** — логотип, ближайший матч, последний результат,
   форма (В/Н/П последних 5 игр).
3. **Расписание матчей** — прошедшие и предстоящие игры сезона.
4. **Турнирная таблица** — позиция команды + полная таблица лиги.
5. **Состав команды** — игроки с позицией (номеров free tier не отдаёт).

Новости — вне MVP (football-data.org их не отдаёт; при необходимости
добавить отдельным источником позже).

## Стек и архитектура

- Vue 3 (Composition API) + TypeScript + Vite
- Vue Router — навигация между экранами
- Pinia — состояние (выбранная команда, кэш данных API)
- Tailwind CSS v4 — стили (подключён как плагин Vite, без `tailwind.config.js`)
- Reka UI — headless-компоненты (табы, дропдауны, диалоги)
- Автотесты не пишем (решение пользователя); Vitest остался от scaffold'а
- Cloudflare Workers — хостинг статики (`dist/`) и прокси `/api/football/*` с кэшем в KV
  (`worker/index.ts`, конфиг `wrangler.json`)
- Sentry (ленивая загрузка, только ошибки) + Cloudflare Web Analytics —
  `src/services/monitoring.ts`, включаются только в прод-сборке при заданных `VITE_*`
- Workers Logs — логи прокси (`{ path, status, cache, durationMs }`)
- GitHub Actions (`.github/workflows/ci.yml`) — проверки на PR, деплой на push в `main`
- football-data.org — источник данных о лигах/командах/матчах/таблицах

### Структура (план)

```
src/
  services/footballApi.ts   — обёртка над fetch к football-data.org
  types/football.ts         — типы ответов API
  stores/team.ts            — Pinia store: выбранная команда, кэш
  composables/
    useTeam.ts
    useMatches.ts
    useStandings.ts
  views/
    SelectTeamView.vue
    DashboardView.vue
    MatchesView.vue
    StandingsView.vue
    SquadView.vue
  router/index.ts
worker/
  index.ts                  — Cloudflare Worker: прокси к API + кэш в KV
  worker-configuration.d.ts — генерируется `wrangler types`, не править
```

Роуты: `/`, `/select-team`, `/team/:id`, `/team/:id/matches`,
`/team/:id/squad`, `/team/:id/standings`.

### Важные технические ограничения

- football-data.org free tier: 10 запросов/минуту, ограниченный набор лиг
  (топ-чемпионаты: АПЛ, Ла Лига, Бундеслига и т.д.).
- Free tier не отдаёт CORS-заголовки для браузерных запросов — в dev запросы
  идут через прокси в `vite.config.ts` (`server.proxy`, путь `/api/football`),
  который же подставляет заголовок `X-Auth-Token`.
- В проде тот же путь `/api/football` обслуживает Worker: ключ — секрет
  `FOOTBALL_API_KEY` (`wrangler secret put`), локально `wrangler dev` берёт его
  из `.env.local`. Лимит 10 запросов/мин общий для всех посетителей, поэтому
  Worker кэширует ответы в KV (10 мин матчи/таблица, 6 ч остальное) и при
  ошибке API отдаёт устаревшую копию (`X-Cache: STALE`).
- KV free tier: 1000 записей в день — TTL на сервере не уменьшать без расчёта.
- API-ключ **не коммитить**: он лежит в `.env.local` (покрыт `*.local`
  в `.gitignore`), шаблон без значения — в `.env.example`.
- Ключ используется **только** в конфиге прокси (серверная часть Vite), в коде
  клиента заголовок `X-Auth-Token` не указывать — иначе ключ попадёт в бандл.

## Правила работы над кодом

- Composition API везде, `<script setup>`, без Options API.
- Не добавлять авторизацию/бэкенд/БД, пока явно не попросили — вне скоупа MVP.
- Не вводить абстракции под гипотетическое будущее (например, поддержку
  других видов спорта) — сейчас только футбол.
- Кэшировать ответы API в Pinia store, чтобы не упираться в rate limit
  (10 запросов/мин).
- Комментарии в коде — только когда неочевидна причина (WHY), не что делает код.
