---
paths:
  - "src/**/*.vue"
  - "src/**/*.css"
---

# Стили: Tailwind CSS v4

- Tailwind v4 подключён через `@tailwindcss/vite`. Файла `tailwind.config.js` нет и не нужно: тема настраивается в CSS через `@theme { ... }` в `src/assets/main.css`.
- Не советовать синтаксис v3 (`tailwind.config.js`, `@tailwind base/components/utilities`, `theme.extend`). Если не уверен в синтаксисе v4 — смотреть документацию через context7.
- Стили — утилитами в шаблоне. `@apply` и `<style scoped>` — только для того, что утилитами не выразить.
- Цвета бренда и клубов задавать токенами в `@theme` (`--color-primary`), а не hex-значениями в разметке.
- Состояния компонентов Reka UI стилизовать через data-атрибуты: `data-[state=active]:...`, `data-[highlighted]:...`.
- Mobile-first: базовые классы для мобильного экрана, `md:`/`lg:` — для расширения.
- Контраст текста — не ниже WCAG AA.
