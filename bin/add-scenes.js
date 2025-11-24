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

function updateIndexForScenes(indexContent) {
    if (indexContent.includes("ctx.scene.enter('my-scene')") || indexContent.includes("from './scenes'")) {
        return { content: indexContent, changed: false };
    }

    let updated = indexContent;
    const telegrafImportRegex = /import\s+\{[^}]*Telegraf[^}]*\}\s+from\s+'telegraf';/;

    if (telegrafImportRegex.test(updated)) {
        updated = updated.replace(
            telegrafImportRegex,
            "import { Telegraf, Scenes, session } from 'telegraf';\nimport { myScene } from './scenes';"
        );
    } else {
        throw new Error('Could not find Telegraf import in src/index.ts for scenes setup.');
    }

    const botInitRegex = /const\s+bot\s*=\s*new\s+Telegraf[^\n]*\n/;
    if (botInitRegex.test(updated)) {
        updated = updated.replace(
            botInitRegex,
            "const bot = new Telegraf<Scenes.WizardContext>(token);\n\nconst stage = new Scenes.Stage<Scenes.WizardContext>([myScene]);\nbot.use(session());\nbot.use(stage.middleware());\n"
        );
    } else {
        throw new Error('Could not find bot initialization in src/index.ts.');
    }

    if (!updated.includes("ctx.scene.enter('my-scene')")) {
        const helpPattern = /bot.help\(\(ctx\) => {\n[\s\S]*?}\);\n/;
        const textPattern = /bot.on\('text'[\s\S]*?\);\n/;
        let inserted = false;

        if (helpPattern.test(updated)) {
            updated = updated.replace(
                helpPattern,
                (match) => `${match}\nbot.command('scene', (ctx) => ctx.scene.enter('my-scene'));\n`
            );
            inserted = true;
        } else if (textPattern.test(updated)) {
            updated = updated.replace(
                textPattern,
                (match) => `${match}\nbot.command('scene', (ctx) => ctx.scene.enter('my-scene'));\n`
            );
            inserted = true;
        }

        if (!inserted) {
            updated = updated.replace(
                'bot.catch((err) => {',
                "bot.command('scene', (ctx) => ctx.scene.enter('my-scene'));\n\nbot.catch((err) => {"
            );
        }
    }

    return { content: updated, changed: true };
}

function addScenes() {
    try {
        console.log('🚀 Adding scenes/wizards setup...');

        // 1. Create scenes.ts
        fs.writeFileSync(path.join(projectPath, 'src/scenes.ts'), scenesContent);
        console.log('✅ Created src/scenes.ts');

        // 2. Update src/index.ts to use scenes
        const indexPath = path.join(projectPath, 'src/index.ts');
        let indexContent = fs.readFileSync(indexPath, 'utf-8');

        const { content: updatedIndex, changed } = updateIndexForScenes(indexContent);
        if (!changed) {
            console.log('ℹ️ Scenes already configured in src/index.ts, skipping file update.');
        } else {
            fs.writeFileSync(indexPath, updatedIndex);
            console.log('✅ Updated src/index.ts to use scenes');
        }

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
