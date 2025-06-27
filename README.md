# create-telebot

A CLI tool to quickly create Telegram bot projects with Bun and Telegraf.

## Quick Start

Create a new Telegram bot project with interactive setup:

```bash
npx create-telebot my-bot
# or
bunx create-telebot my-bot
```

The CLI will guide you through:
- Setting your bot token (optional)
- Choosing features (webhook support, scenes/wizards)
- Selecting webhook framework (Fastify or Hono)

Then:
```bash
cd my-bot
bun run dev
```

### Non-Interactive Mode

Skip the interactive prompts:

```bash
create-telebot my-bot --no-interactive
create-telebot my-bot --token "your-bot-token" --no-interactive
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

### Optional Features (via interactive setup)

- **Webhook Support** - HTTP server with Fastify or Hono
- **Scenes/Wizards** - Conversation flow management
- **Auto-configuration** - Features are set up automatically

## Project Structure

```
my-bot/
├── src/
│   ├── index.ts      # Main bot file
│   ├── server.ts     # Webhook server (if selected)
│   └── scenes.ts     # Conversation scenes (if selected)
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

## Adding Features Later

You can add features to existing projects:

### Webhook Support

```bash
bun run add:webhook
# or choose framework
bun run add:webhook --framework hono
```

### Scenes/Wizards Support

```bash
bun run add:scenes
```

## CLI Options

```bash
create-telebot <project-name> [options]

Options:
  --token <token>      Pre-fill bot token in .env file
  --no-interactive     Skip interactive setup
  --help, -h           Show help message

Examples:
  create-telebot my-bot
  create-telebot my-bot --token "123456789:ABC..."
  create-telebot my-bot --no-interactive
```

### Adding Scenes/Wizards Support

To add scenes/wizards support to your project, run the following command:

```bash
bun run add:scenes
```

This will create a `scenes.ts` file with a basic wizard scene and update your `index.ts` to handle it.

## Requirements

- [Bun](https://bun.sh) installed on your system
