import { Telegraf } from 'telegraf';
import { config } from 'dotenv';

config();

const token = process.env.BOT_TOKEN;
const defaultLocale = process.env.LOCALE || 'en';
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX || 5);
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 5000);

if (!token) {
  console.error('❌ BOT_TOKEN is required. Add it to your .env file.');
  process.exit(1);
}

const bot = new Telegraf(token);
const userLocales = new Map<number, string>();
const rateLimits = new Map<number, { count: number; reset: number }>();

const translations: Record<string, Record<string, string>> = {
  en: {
    welcome: 'Welcome! I am your new Telegram bot 🤖',
    help: 'Available commands:\n/start - Start the bot\n/help - Show this help message\n/lang <en|ru> - Switch language\n/menu - Show commands',
    rate_limited: 'Too many requests, please slow down.',
    unknown_lang: 'Unknown language. Use en or ru.',
    lang_changed: 'Language updated.',
    menu: 'Menu:\n/start\n/help\n/lang <en|ru>\n/menu',
  },
  ru: {
    welcome: 'Привет! Я ваш новый Telegram-бот 🤖',
    help: 'Доступные команды:\n/start - Запуск бота\n/help - Помощь\n/lang <en|ru> - Сменить язык\n/menu - Показать команды',
    rate_limited: 'Слишком много запросов, замедлитесь.',
    unknown_lang: 'Неизвестный язык. Используйте en или ru.',
    lang_changed: 'Язык обновлён.',
    menu: 'Меню:\n/start\n/help\n/lang <en|ru>\n/menu',
  },
};

function getLocale(ctx: any) {
  const key = ctx.from?.id ?? ctx.chat?.id;
  if (key && userLocales.has(key)) {
    return userLocales.get(key)!;
  }
  return defaultLocale in translations ? defaultLocale : 'en';
}

function t(locale: string, key: string) {
  const dict = translations[locale] || translations.en;
  return dict[key] || translations.en[key] || key;
}

bot.use(async (ctx, next) => {
  const key = ctx.from?.id ?? ctx.chat?.id;
  if (!key) return next();

  const now = Date.now();
  const current = rateLimits.get(key) || { count: 0, reset: now + RATE_LIMIT_WINDOW_MS };
  const windowReset = now > current.reset ? now + RATE_LIMIT_WINDOW_MS : current.reset;
  const count = now > current.reset ? 1 : current.count + 1;

  rateLimits.set(key, { count, reset: windowReset });

  if (count > RATE_LIMIT_MAX) {
    return ctx.reply(t(getLocale(ctx), 'rate_limited'));
  }

  return next();
});

bot.telegram.setMyCommands([
  { command: 'start', description: 'Start the bot' },
  { command: 'help', description: 'Show help' },
  { command: 'menu', description: 'Show commands' },
  { command: 'lang', description: 'Set language: /lang en|ru' },
]);

bot.start((ctx) => {
  const locale = getLocale(ctx);
  ctx.reply(t(locale, 'welcome'));
});

bot.help((ctx) => {
  const locale = getLocale(ctx);
  ctx.reply(t(locale, 'help'));
});

bot.command('menu', (ctx) => {
  const locale = getLocale(ctx);
  ctx.reply(t(locale, 'menu'));
});

bot.command('lang', (ctx) => {
  const nextLang = ctx.message.text.split(' ')[1]?.trim().toLowerCase();
  if (!nextLang || !translations[nextLang]) {
    return ctx.reply(t(getLocale(ctx), 'unknown_lang'));
  }
  const key = ctx.from?.id ?? ctx.chat?.id;
  if (key) {
    userLocales.set(key, nextLang);
  }
  ctx.reply(t(nextLang, 'lang_changed'));
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
