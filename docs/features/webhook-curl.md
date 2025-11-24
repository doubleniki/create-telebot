# Примеры curl для вебхуков
- Проверка health-эндпоинта (Fastify/Hono):  
  `curl http://localhost:3000/health`
- Тестовый апдейт на вебхук (замените путь/порт под свой `WEBHOOK_PATH`/`PORT`):  
  `curl -X POST http://localhost:3000/telebot-webhook -H "Content-Type: application/json" -d '{"update_id":1,"message":{"message_id":1,"from":{"id":123,"first_name":"Test"},"chat":{"id":123,"type":"private"},"date":0,"text":"/start"}}'`
- Регистрация вебхука (после запуска сервера и выставления `SET_WEBHOOK=true` в .env):  
  `curl -X POST https://api.telegram.org/bot<your-token>/setWebhook -d "url=<WEBHOOK_URL><WEBHOOK_PATH>"`
- Сброс вебхука:  
  `curl -X POST https://api.telegram.org/bot<your-token>/deleteWebhook`
