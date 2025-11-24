# Roadmap

## 1. Улучшения UX CLI
- [x] `--dry-run --verbose` с превью файлов (базовый вывод)
- [x] `--no-color` и вывод без эмодзи
- [x] Флаг `--template <path>` для кастомных шаблонов (локальный путь)

## 2. Генерация тестов/CI
- [x] Шаблон GitHub Actions: lint + bun test
- [x] Автогенерация минимальных тестов для созданного бота (ping команды, webhook health)

## 3. Расширение фич бота
- [x] Пресет для меню/commands list (BotCommand)
- [x] Опция включить rate limiting/anti-spam middleware
- [x] Пресет для локализации (i18n) с примером

## 4. Вебхук/доставка
- [ ] Поддержка Secret Token в webhook (X-Telegram-Bot-Api-Secret-Token)
- [ ] Опция включить прокси/ngrok автоконфиг (dry-run для команд)

## 5. DX генератора
- [ ] `--git-init` и автосоздание первого коммита (опционально)
- [ ] `--license <mit|apache>` и README-бейджи
- [x] Флаг `--env-from <file>` для автонаполнения .env

## 6. Шаблоны
- [ ] Вариант с Hono/Fastify по умолчанию (toggle)
- [ ] Пресет с scenes + wizard + session storage (memory) с возможностью сменить на Redis
