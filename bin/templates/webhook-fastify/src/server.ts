import { Telegraf } from 'telegraf';
import fastify from 'fastify';

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
const server = fastify();

server.addHook('onRequest', async (req, reply) => {
  if (secretToken) {
    const header = req.headers['x-telegram-bot-api-secret-token'];
    if (header !== secretToken) {
      reply.status(401).send({ ok: false });
      return reply;
    }
  }
});

async function start() {
  if (shouldSetWebhook) {
    if (!webhookBase) {
      throw new Error('WEBHOOK_URL must be provided when SET_WEBHOOK=true');
    }
    const fullWebhookUrl = `${webhookBase}${webhookPath}`;
    await bot.telegram.setWebhook(fullWebhookUrl, secretToken ? { secret_token: secretToken } : undefined);
    console.log(`✅ Webhook set to ${fullWebhookUrl}`);
  } else {
    console.log('ℹ️ Skipping bot.telegram.setWebhook (set SET_WEBHOOK=true to enable)');
  }

  server.post(webhookPath, async (req, reply) => {
    await bot.handleUpdate(req.body as any, reply.raw);
    return reply.send({ ok: true });
  });

  server.get('/health', async () => ({ status: 'ok' }));

  try {
    const address = await server.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 Server listening on ${address}`);
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

start();
