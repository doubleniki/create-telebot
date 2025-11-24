#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const projectPath = process.cwd();

const fastifyServerContent = `import { Telegraf } from 'telegraf';
import fastify from 'fastify';

const token = process.env.BOT_TOKEN;
if (!token) {
  throw new Error('BOT_TOKEN must be provided!');
}

const webhookBase = process.env.WEBHOOK_URL;
const webhookPath = process.env.WEBHOOK_PATH || '/telebot-webhook';
const shouldSetWebhook = process.env.SET_WEBHOOK === 'true';
const port = Number(process.env.PORT) || 3000;

const bot = new Telegraf(token);
const server = fastify();

async function start() {
  if (shouldSetWebhook) {
    if (!webhookBase) {
      throw new Error('WEBHOOK_URL must be provided when SET_WEBHOOK=true');
    }
    const fullWebhookUrl = \`\${webhookBase}\${webhookPath}\`;
    await bot.telegram.setWebhook(fullWebhookUrl);
    console.log(\`✅ Webhook set to \${fullWebhookUrl}\`);
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
    console.log(\`🚀 Server listening on \${address}\`);
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

start();
`;

const honoServerContent = `import { Telegraf } from 'telegraf';
import { Hono } from 'hono';

const token = process.env.BOT_TOKEN;
if (!token) {
  throw new Error('BOT_TOKEN must be provided!');
}

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
  const fullWebhookUrl = \`\${webhookBase}\${webhookPath}\`;
  bot.telegram.setWebhook(fullWebhookUrl)
    .then(() => console.log(\`✅ Webhook set to \${fullWebhookUrl}\`))
    .catch((err) => {
      console.error('❌ Failed to set webhook:', err);
      process.exit(1);
    });
} else {
  console.log('ℹ️ Skipping bot.telegram.setWebhook (set SET_WEBHOOK=true to enable)');
}

app.post(webhookPath, async (c) => {
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
`;

function parseArgs() {
    const args = process.argv.slice(2);
    const options = { framework: 'fastify' }; // Default to fastify

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === '--framework' && i + 1 < args.length) {
            const framework = args[i + 1].toLowerCase();
            if (framework === 'hono' || framework === 'fastify') {
                options.framework = framework;
            } else {
                console.warn(`⚠️ Unknown framework: ${framework}. Defaulting to fastify.`);
            }
            i++;
        }
    }
    return options;
}


function addWebhook() {
  try {
    const { framework } = parseArgs();
    console.log(`🚀 Adding webhook setup with ${framework}...`);

    // 1. Install dependency
    console.log(`📦 Installing ${framework}...`);
    execSync(`bun add ${framework}`, { stdio: 'inherit' });

    // 2. Create server.ts
    const serverContent = framework === 'hono' ? honoServerContent : fastifyServerContent;
    fs.writeFileSync(path.join(projectPath, 'src/server.ts'), serverContent);
    console.log('✅ Created src/server.ts');

    // 3. Add start:webhook script to package.json
    const packageJsonPath = path.join(projectPath, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    packageJson.scripts['start:webhook'] = 'bun run src/server.ts';
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Added start:webhook script to package.json');

    // 4. Update .gitignore
    const gitignorePath = path.join(projectPath, '.gitignore');
    let gitignoreContent = '';
    if (fs.existsSync(gitignorePath)) {
        gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
    }
    if (!gitignoreContent.includes('node_modules')) {
        fs.appendFileSync(gitignorePath, '\nnode_modules\n');
        console.log('✅ Updated .gitignore');
    }
    
    console.log('\n🎉 Webhook setup complete!\n');
    console.log('Next steps:');
    console.log('1. Set WEBHOOK_URL and optional WEBHOOK_PATH in the .env file.');
    console.log('2. Set SET_WEBHOOK=true when you want to register the webhook URL.');
    console.log('3. Run `bun run start:webhook` to start the server (set PORT if needed).');
    
  } catch (error) {
    console.error('❌ Error adding webhook setup:', error.message);
    process.exit(1);
  }
}

addWebhook();
