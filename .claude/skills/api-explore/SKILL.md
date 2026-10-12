---
name: api-explore
description: Посмотреть реальный ответ эндпоинта football-data.org через dev-прокси и вывести из него TypeScript-типы. Использовать, когда нужно узнать структуру ответа API, описать типы или понять, почему запрос падает.
argument-hint: "<путь эндпоинта, напр. /competitions/PL/standings>"
allowed-tools: Bash(curl -s *localhost:5173/api/football/*), Bash(jq *), Bash(mkdir -p node_modules/.cache/football-api*), Bash(ls node_modules/.cache/football-api*), Read
---

# Исследование эндпоинта: $ARGUMENTS

Free tier: 10 запросов в минуту. Каждый запрос на счету.

## 1. Сначала кэш

Ответы сохраняются в `node_modules/.cache/football-api/` (папка в gitignore, ключ туда не попадает). Имя файла — путь эндпоинта, где `/` заменён на `_`, например `competitions_PL_standings.json`. Если файл уже есть — работай с ним и не делай запрос.

## 2. Запрос через dev-прокси

- Проверь, что dev-сервер запущен: `curl -s -o /dev/null -w '%{http_code}' http://localhost:5173/`. Если нет — попроси пользователя запустить `npm run dev` (сам не запускай: процесс долгоживущий).
- Запрос: `curl -s -w '\n%{http_code}' http://localhost:5173/api/football$ARGUMENTS`. Ключ подставляет прокси — **никогда** не добавляй `X-Auth-Token` и не читай `.env.local`.
- Сохрани тело ответа в кэш-файл.
- Коды ошибок: 403 — лига или ресурс недоступны на free tier; 429 — лимит, подожди минуту; 400 — неверные параметры.

## 3. Анализ

- Покажи структуру через `jq` (ключи верхнего уровня, один элемент массива), а не весь JSON.
- Отметь поля, которые бывают `null` (счёт несыгранного матча, `shirtNumber`, `crest`).
- Предложи TypeScript-интерфейсы **только для полей, нужных экранам MVP**; nullable-поля — `T | null`. Это подсказка в ответе: файл `src/types/football.ts` пишет пользователь.
- Если в ответе есть пагинация или фильтры (`?status=`, `?season=`, `?limit=`), упомяни их.
