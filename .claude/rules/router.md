---
paths:
  - "src/router/**"
  - "src/views/**"
---

# Vue Router

- Views подключать лениво: `component: () => import('@/views/MatchesView.vue')`.
- Каждому роуту — `name`; навигация через `{ name, params }`, а не строками путей.
- Параметр `:id` приходит строкой — приводить к числу и валидировать. На невалидный id делать редирект на `/select-team`.
- Редирект с `/` на `/team/:id` или `/select-team` — в `beforeEnter`/`beforeEach`, по выбранной команде из store.
- History: `createWebHistory(import.meta.env.BASE_URL)`. Для GitHub Pages нужно настроить `base` в Vite и fallback для SPA (404.html) — решается на шаге деплоя.
