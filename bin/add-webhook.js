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

const bot = new Telegraf(token);
const server = fastify();

const webhookUrl = process.env.WEBHOOK_URL;
if (!webhookUrl) {
    throw new Error('WEBHOOK_URL must be provided!');
}

// Set the bot's webhook.
// Note: You need to run this once to set the webhook.
// After that, you can comment it out or remove it.
bot.telegram.setWebhook(webhookUrl);

server.post(`/<path-to-webhook>`, (req, res) => {
  return bot.handleUpdate(req.body as any, res.raw);
});

bot.command('start', (ctx) => ctx.reply('Hello from webhook!'));

server.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`🚀 Server listening on ${address}`);
});
`;

const honoServerContent = `import { Telegraf } from 'telegraf';
import { Hono } from 'hono';

const token = process.env.BOT_TOKEN;
if (!token) {
  throw new Error('BOT_TOKEN must be provided!');
}

const bot = new Telegraf(token);
const app = new Hono();

const webhookUrl = process.env.WEBHOOK_URL;
if (!webhookUrl) {
    throw new Error('WEBHOOK_URL must be provided!');
}

// Set the bot's webhook.
// Note: You need to run this once to set the webhook.
// After that, you can comment it out or remove it.
bot.telegram.setWebhook(webhookUrl);

app.post(`/<path-to-webhook>`, async (c) => {
    const body = await c.req.json();
    await bot.handleUpdate(body);
    return c.json({ status: 'ok' });
});

bot.command('start', (ctx) => ctx.reply('Hello from webhook!'));

export default {
    port: 3000,
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
    console.log('1. Set your WEBHOOK_URL in the .env file.');
    console.log('2. Update the webhook path in src/server.ts.');
    console.log('3. Run `bun run start:webhook` to start the server.');
    
  } catch (error) {
    console.error('❌ Error adding webhook setup:', error.message);
    process.exit(1);
  }
}

addWebhook();