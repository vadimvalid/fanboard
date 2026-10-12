---
paths:
  - "src/**/__tests__/**"
  - "src/**/*.spec.ts"
  - "src/**/*.test.ts"
  - "vitest.config.ts"
---

# Тесты: Vitest + Vue Test Utils

- Тесты лежат в `__tests__/` рядом с кодом, имя — `*.spec.ts`. Окружение — jsdom (задано в `vitest.config.ts`).
- Реальный API в тестах не вызывать: мокать `fetch` через `vi.stubGlobal('fetch', vi.fn())` или мокать модуль `@/services/footballApi` через `vi.mock`.
- Pinia в тестах: `setActivePinia(createPinia())` в `beforeEach`; при монтировании передавать `global: { plugins: [pinia, router] }`.
- Проверять поведение, видимое пользователю (текст, роли, эмиты), а не внутреннее состояние компонента.
- После асинхронных действий — `await flushPromises()`.
- Обязательно покрыть: кэш и TTL в store, обработку 429/ошибок в API-слое, расчёт формы (В/Н/П).
- Запуск: `npx vitest run` (один прогон) или `npm run test:unit` (watch).
