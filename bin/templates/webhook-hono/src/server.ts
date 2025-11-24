import { Telegraf } from 'telegraf';
import { Hono } from 'hono';

const token = process.env.BOT_TOKEN;
if (!token) {
  throw new Error('BOT_TOKEN must be provided!');
}

const secretToken = process.env.TELEGRAM_SECRET_TOKEN;
const webhookBase = process.env.WEBHOOK_URL;
const webhookPath = process.env.WEBHOOK_PATH || '/telebot-webhook';
const shouldSetWebhook = process.env.SET_WEBHOOK === 'true';
const port = Number(process.env.PORT) || 3000;

const bot = new Telegraf(token);
const app = new Hono();

if (shouldSetWebhook) {
  if (!webhookBase) {
    throw new Error('WEBHOOK_URL must be provided when SET_WEBHOOK=true');
  }
  const fullWebhookUrl = `${webhookBase}${webhookPath}`;
  bot.telegram
    .setWebhook(fullWebhookUrl, secretToken ? { secret_token: secretToken } : undefined)
    .then(() => console.log(`✅ Webhook set to ${fullWebhookUrl}`))
    .catch((err) => {
      console.error('❌ Failed to set webhook:', err);
      process.exit(1);
    });
} else {
  console.log('ℹ️ Skipping bot.telegram.setWebhook (set SET_WEBHOOK=true to enable)');
}

app.post(webhookPath, async (c) => {
  if (secretToken) {
    const header = c.req.header('x-telegram-bot-api-secret-token');
    if (header !== secretToken) return c.json({ ok: false }, 401);
  }
  const body = await c.req.json();
  await bot.handleUpdate(body);
  return c.json({ status: 'ok' });
});

app.get('/health', (c) => c.json({ status: 'ok' }));

bot.command('start', (ctx) => ctx.reply('Hello from webhook!'));

export default {
  port,
  fetch: app.fetch,
};
