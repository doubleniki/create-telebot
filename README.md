# create-telebot

A CLI tool to quickly create Telegram bot projects with Bun and Telegraf.

## Quick Start

Create a new Telegram bot project with one command:

```bash
npx create-telebot my-bot
# or
bunx create-telebot my-bot
```

Then:
```bash
cd my-bot
cp .env.example .env
# Add your bot token to .env
bun run dev
```

## Global Installation

Install globally for repeated use:

```bash
npm install -g create-telebot
# or
bun install -g create-telebot

# Then use anywhere:
create-telebot my-new-bot
```

## What's Included

The generated project includes:

- **Telegraf** - Modern Telegram Bot API framework
- **TypeScript** - Full TypeScript support
- **Bun** - Fast JavaScript runtime
- **Hot reload** - Development with auto-restart
- **Environment config** - Secure token management
- **Basic commands** - `/start` and `/help` handlers
- **Message echo** - Example text message handling
- **Graceful shutdown** - Proper bot lifecycle management

## Project Structure

```
my-bot/
├── index.ts          # Main bot file
├── package.json      # Dependencies and scripts
├── tsconfig.json     # TypeScript configuration
├── .env.example      # Environment template
├── .gitignore        # Git ignore rules
└── README.md         # Project documentation
```

## Development

After creating a project:

1. Get your bot token from [@BotFather](https://t.me/botfather)
2. Copy `.env.example` to `.env` and add your token
3. Run `bun run dev` for development with hot reload
4. Run `bun run start` for production

## Requirements

- [Bun](https://bun.sh) installed on your system
