#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const projectPath = process.cwd();

const scenesContent = `import { Scenes, Telegraf, Composer } from 'telegraf';

// Handler for the first step of the wizard
const nameHandler = new Composer<Scenes.WizardContext>();
nameHandler.on('text', async (ctx) => {
    await ctx.reply(`Hello, ${ctx.message.text}!`);
    return ctx.scene.leave();
});
nameHandler.command('cancel', async (ctx) => {
    await ctx.reply('Scene cancelled.');
    return ctx.scene.leave();
});
nameHandler.use((ctx) => ctx.reply('Please enter your name as a text message.'));

// Create a wizard scene
export const myScene = new Scenes.WizardScene(
    'my-scene',
    async (ctx) => {
        await ctx.reply('What is your name?');
        return ctx.wizard.next();
    },
    nameHandler
);
`;

function addScenes() {
    try {
        console.log('🚀 Adding scenes/wizards setup...');

        // 1. Create scenes.ts
        fs.writeFileSync(path.join(projectPath, 'scenes.ts'), scenesContent);
        console.log('✅ Created scenes.ts');

        // 2. Update index.ts to use scenes
        const indexPath = path.join(projectPath, 'index.ts');
        let indexContent = fs.readFileSync(indexPath, 'utf-8');

        // Add imports
        indexContent = indexContent.replace(
            'import { Telegraf } from \'telegraf\';',
            'import { Telegraf, Scenes, session } from \'telegraf\';\nimport { myScene } from \'./scenes\';'
        );

        // Add stage middleware
        indexContent = indexContent.replace(
            'const bot = new Telegraf(token);',
            'const bot = new Telegraf<Scenes.WizardContext>(token);\n\nconst stage = new Scenes.Stage<Scenes.WizardContext>([myScene]);\nbot.use(session());\nbot.use(stage.middleware());'
        );

        // Add command to enter the scene
        indexContent = indexContent.replace(
            "bot.command('help', (ctx) => ctx.reply('Send me a sticker'));",
            "bot.command('help', (ctx) => ctx.reply('Send me a sticker'));\n\nbot.command('scene', (ctx) => ctx.scene.enter('my-scene'));"
        );

        fs.writeFileSync(indexPath, indexContent);
        console.log('✅ Updated index.ts to use scenes');

        console.log('\n🎉 Scenes/Wizards setup complete!\n');
        console.log('Next steps:');
        console.log('1. Run `bun run dev` to start the bot.');
        console.log('2. Send the /scene command to the bot to start the wizard.');

    } catch (error) {
        console.error('❌ Error adding scenes/wizards setup:', error.message);
        process.exit(1);
    }
}

addScenes();
