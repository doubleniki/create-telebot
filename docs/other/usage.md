# Инструкция (RU)
## Установка и запуск
- Одноразово без установки: `npx create-telebot <имя>` или `bunx create-telebot <имя>`.
- Глобально: `npm install -g create-telebot` или `bun install -g create-telebot`, затем `create-telebot <имя>`.
- Разработка самого CLI: `bun run src/index.ts` или `bun run --watch src/index.ts`.

## Основные флаги
- `--token <BOT_TOKEN>` — сразу записать токен в `.env`.
- `--no-interactive` — отключить вопросы (используются только флаги).
- `--package-manager <bun|npm|pnpm|yarn>` — выбрать ПМ (по умолчанию `bun`).
- `--skip-install` — пропустить установку зависимостей.
- `--framework <fastify|hono>` — фреймворк для вебхука, если выбрана фича webhook.
- `--dry-run` — показать план действий и список файлов без записи.
- `--no-emoji` — логи без эмодзи.
- `--help` — краткая справка.

## Процесс создания бота
1) Запуск: `create-telebot my-bot [флаги]`.  
2) Если интерактив включён, выберите фичи (webhook, scenes), ПМ и опции.  
3) Сгенерированные команды дальше:  
   - Установка, если пропустили: `bun install` или выбранный ПМ.  
   - Создать `.env`: `cp .env.example .env`, вписать `BOT_TOKEN`.  
   - Запуск dev: `bun run dev`.

## Добавление фич после генерации
- Вебхук: `bun run add:webhook -- --framework hono|fastify` (или `node bin/add-webhook.js`). Настройте `.env`: `WEBHOOK_URL`, `WEBHOOK_PATH` (по умолчанию `/telebot-webhook`), `SET_WEBHOOK=true` чтобы зарегистрировать URL.
- Сцены/визарды: `bun run add:scenes` (или `node bin/add-scenes.js`). Добавит `src/scenes.ts` и подключит сцену `/scene`.

## Проверка и отладка
- Health чек вебхука: `curl http://localhost:3000/health`.
- Тест апдейта на вебхук: `curl -X POST http://localhost:3000/telebot-webhook -H "Content-Type: application/json" -d '{"update_id":1,"message":{"message_id":1,"from":{"id":123,"first_name":"Test"},"chat":{"id":123,"type":"private"},"date":0,"text":"/start"}}'`.
- Сброс вебхука: `curl -X POST https://api.telegram.org/bot<token>/deleteWebhook`.

## Dev-скрипты репозитория
- `bun run --watch src/index.ts` — разработка CLI.
- `bun test` — базовые проверки шаблонов/скриптов.
- `bun run lint` / `bun run format` — Biome.

# Instruction (EN)
## Install and run
- One-shot: `npx create-telebot <name>` or `bunx create-telebot <name>`.
- Global: `npm install -g create-telebot` or `bun install -g create-telebot`, then `create-telebot <name>`.
- Develop the CLI: `bun run src/index.ts` or `bun run --watch src/index.ts`.

## Key flags
- `--token <BOT_TOKEN>` — prefill `.env`.
- `--no-interactive` — skip prompts, use flags only.
- `--package-manager <bun|npm|pnpm|yarn>` — pick package manager (default `bun`).
- `--skip-install` — skip installing dependencies.
- `--framework <fastify|hono>` — webhook framework when webhook feature is chosen.
- `--dry-run` — show planned actions and files without writing.
- `--no-emoji` — log without emojis.
- `--help` — short help.

## Bot creation flow
1) Run: `create-telebot my-bot [flags]`.  
2) If interactive, pick features (webhook, scenes), PM, and options.  
3) Next steps:  
   - Install deps if skipped: `bun install` or chosen PM.  
   - Create `.env`: `cp .env.example .env`, set `BOT_TOKEN`.  
   - Start dev: `bun run dev`.

## Add features later
- Webhook: `bun run add:webhook -- --framework hono|fastify` (or `node bin/add-webhook.js`). Configure `.env`: `WEBHOOK_URL`, `WEBHOOK_PATH` (default `/telebot-webhook`), `SET_WEBHOOK=true` to register the URL.
- Scenes/wizards: `bun run add:scenes` (or `node bin/add-scenes.js`). Adds `src/scenes.ts` and `/scene` command.

## Check and debug
- Health check: `curl http://localhost:3000/health`.
- Test update: `curl -X POST http://localhost:3000/telebot-webhook -H "Content-Type: application/json" -d '{"update_id":1,"message":{"message_id":1,"from":{"id":123,"first_name":"Test"},"chat":{"id":123,"type":"private"},"date":0,"text":"/start"}}'`.
- Drop webhook: `curl -X POST https://api.telegram.org/bot<token>/deleteWebhook`.

## Repo dev scripts
- `bun run --watch src/index.ts` — develop the CLI.
- `bun test` — basic template/script checks.
- `bun run lint` / `bun run format` — Biome.
