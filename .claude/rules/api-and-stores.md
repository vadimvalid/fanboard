---
paths:
  - "src/services/**"
  - "src/types/**"
  - "src/stores/**"
  - "src/composables/**"
  - "vite.config.ts"
  - ".env*"
---

# API football-data.org, stores и composables

## API-слой (`src/services/footballApi.ts`)

- Базовый путь в клиенте — только `/api/football/...` (dev-прокси Vite). Прямой URL `api.football-data.org` в клиенте не использовать: нет CORS.
- Заголовок `X-Auth-Token` в клиентском коде не указывать никогда — его подставляет прокси. Переменные с префиксом `VITE_` попадают в бандл, если на них есть ссылка через `import.meta.env`, поэтому ключ не должен читаться клиентским кодом.
- `fetch`-обёртка: проверять `response.ok`, отдельно обрабатывать 429 (rate limit) и 403 (лига недоступна на free tier), бросать типизированную ошибку.
- Ответы типизировать интерфейсами из `src/types/football.ts`, описанными по реальному ответу API v4. Без `any`; для непроверенных данных — `unknown` + сужение.

## Pinia (`src/stores/`)

- Только setup-stores: `defineStore('team', () => { ... })`, как в scaffold'е.
- Store — единственное место, которое вызывает `footballApi`. Ответы кэшировать с TTL: free tier даёт 10 запросов в минуту. Перед запросом проверять кэш.
- Параллельные одинаковые запросы дедуплицировать (хранить in-flight Promise).
- Выбранную команду сохранять в localStorage; чтение оборачивать в try/catch (приватный режим, битые данные).
- В компонентах деструктурировать store через `storeToRefs`, иначе теряется реактивность.

## Composables (`src/composables/`)

- Имя — `useXxx`, возвращают refs/computed (`data`, `isLoading`, `error`), а не голые значения.
- Реактивные параметры (id команды из роута) принимать как `MaybeRefOrGetter` и читать через `toValue()` внутри `watch`/`watchEffect`.
