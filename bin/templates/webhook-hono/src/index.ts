import { Telegraf } from 'telegraf';
import { config } from 'dotenv';

config();

const token = process.env.BOT_TOKEN;

if (!token) {
  console.error('❌ BOT_TOKEN is required. Add it to your .env file.');
  process.exit(1);
}

const bot = new Telegraf(token);

bot.start((ctx) => {
  ctx.reply('Welcome! I am your new Telegram bot 🤖');
});

bot.help((ctx) => {
  ctx.reply('Available commands:\n/start - Start the bot\n/help - Show this help message');
});

bot.on('text', (ctx) => {
  ctx.reply(`You said: ${ctx.message.text}`);
});

bot.catch((err) => {
  console.error('❌ Bot error:', err);
});

async function launch() {
  try {
    await bot.launch();
    console.log('Bot is running...');
  } catch (error) {
    console.error('❌ Failed to launch bot:', error);
    process.exit(1);
  }
}

launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
