---
name: new-screen
description: Пошаговый план добавления нового экрана (view + роут + composable + store) в Fanboard. Использовать, когда пользователь начинает новый экран — «делаю экран матчей», «как добавить страницу состава».
argument-hint: "<экран: select-team | dashboard | matches | standings | squad>"
allowed-tools: Read, Glob, Grep
---

# Новый экран: $ARGUMENTS

Режим наставника: выдай план логики и подсказки, логику не пиши. Шаблон и стили view Claude делает сам после того, как пользователь напишет `<script setup>`.

## 1. Разведка

- Найди экран в плане `CLAUDE.md`: роут, назначение, нужные данные.
- Посмотри, что уже есть: типы, `footballApi`, store, composables, соседние views. Переиспользуй, не дублируй.
- Определи эндпоинт football-data.org v4 для данных экрана:
  - выбор команды: `GET /competitions`, `GET /competitions/{code}/teams`
  - дашборд / матчи: `GET /teams/{id}/matches?status=...`, `?limit=`
  - таблица: `GET /competitions/{code}/standings`
  - состав: `GET /teams/{id}` (поле `squad`)

  Если типа ответа ещё нет — сначала предложи `/api-explore`.

## 2. План в порядке выполнения

Для каждого пункта — файл, что в нём должно быть, ключевая подсказка:

1. **Типы** (`src/types/football.ts`) — только поля, которые экран реально показывает.
2. **API** (`src/services/footballApi.ts`) — функция под эндпоинт.
3. **Store** — action с кэшем по ключу (id команды или лиги) и TTL.
4. **Composable** (`src/composables/useXxx.ts`) — принимает `MaybeRefOrGetter<number>`, реагирует на смену id, отдаёт `data / isLoading / error`.
5. **View** (`src/views/XxxView.vue`) — состояния loading, error (отдельно 429), empty, data. Какие компоненты Reka UI подойдут (табы «прошедшие/предстоящие», combobox поиска и т.п.).
6. **Роут** — именованный, ленивый импорт, валидация `:id`.
7. **Навигация** — как попасть на экран с дашборда.

## 3. Критерии готовности

- Экран открывается по прямой ссылке и после перезагрузки.
- Повторный заход не делает новый запрос (видно во вкладке Network или через `/ui-check`).
- `/check` зелёный.

Перед советами по API Vue Router 5, Pinia 4 или Reka UI сверься с context7.
