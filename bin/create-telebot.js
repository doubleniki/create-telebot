#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import prompts from 'prompts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseArgs() {
  const args = process.argv.slice(2);
  const options = { token: null, interactive: true };
  let projectName = null;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--token' && i + 1 < args.length) {
      options.token = args[i + 1];
      i++;
    } else if (arg === '--help' || arg === '-h') {
      showHelp();
      process.exit(0);
    } else if (arg === '--no-interactive') {
      options.interactive = false;
    } else if (!projectName && !arg.startsWith('--')) {
      projectName = arg;
    }
  }

  return { projectName, options };
}

function showHelp() {
  console.log(`
Usage: create-telebot <project-name> [options]

Options:
  --token <token>      Pre-fill bot token in .env file
  --no-interactive     Skip interactive setup
  --help, -h           Show this help message

Examples:
  create-telebot my-bot
  create-telebot my-bot --token "123456789:ABCdefGHIjklMNOpqrstUVwxyz"
`);
}

async function getInteractiveOptions() {
  const questions = [
    {
      type: 'text',
      name: 'token',
      message: 'Bot token (optional, can be set later in .env):',
      initial: ''
    },
    {
      type: 'multiselect',
      name: 'features',
      message: 'Select features to add:',
      choices: [
        { title: 'Webhook support', value: 'webhook', description: 'Add webhook server setup' },
        { title: 'Scenes/Wizards', value: 'scenes', description: 'Add conversation scenes support' }
      ],
      hint: 'Use space to select, enter to confirm'
    },
    {
      type: prev => prev.includes('webhook') ? 'select' : null,
      name: 'framework',
      message: 'Choose webhook framework:',
      choices: [
        { title: 'Fastify', value: 'fastify' },
        { title: 'Hono', value: 'hono' }
      ],
      initial: 0
    }
  ];

  return await prompts(questions);
}

async function createTelebot(projectName, options = {}) {
  if (!projectName) {
    console.error('❌ Please provide a project name');
    showHelp();
    process.exit(1);
  }

  const projectPath = path.resolve(projectName);
  
  if (fs.existsSync(projectPath)) {
    console.error(`❌ Directory ${projectName} already exists`);
    process.exit(1);
  }

  console.log(`🚀 Creating Telegram bot project: ${projectName}`);
  
  // Get interactive options if not disabled
  let interactiveOptions = {};
  if (options.interactive) {
    console.log('\\n📋 Let\'s set up your bot with some options:\\n');
    interactiveOptions = await getInteractiveOptions();
    
    // Merge interactive options with CLI options (CLI takes precedence)
    options = { ...interactiveOptions, ...options };
  }
  
  try {
    // Create project directory
    fs.mkdirSync(projectPath, { recursive: true });
    
    // Copy template files
    const templatePath = path.resolve(__dirname, '..');
    const filesToCopy = [
      'src/index.ts',
      'package.json',
      'tsconfig.json',
      '.env.example',
      '.gitignore'
    ];
    
    // Create src directory
    fs.mkdirSync(path.join(projectPath, 'src'), { recursive: true });
    
    filesToCopy.forEach(file => {
      const srcPath = path.join(templatePath, file);
      const destPath = path.join(projectPath, file);
      
      // Ensure destination directory exists
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      
      if (fs.existsSync(srcPath)) {
        let content = fs.readFileSync(srcPath, 'utf8');
        
        // Update package.json name
        if (file === 'package.json') {
          const packageJson = JSON.parse(content);
          packageJson.name = projectName;
          delete packageJson.bin; // Remove bin field from template
          content = JSON.stringify(packageJson, null, 2);
        }
        
        fs.writeFileSync(destPath, content);
      }
    });
    
    // Create .env file with token if provided
    if (options.token) {
      const envContent = `BOT_TOKEN=${options.token}`;
      fs.writeFileSync(path.join(projectPath, '.env'), envContent);
      console.log('🔑 Bot token added to .env file');
    }
    
    // Create README for the new project
    const readmeContent = `# ${projectName}

A Telegram bot built with Bun and Telegraf.

## Setup

1. Install dependencies:
\`\`\`bash
bun install
\`\`\`

2. Create a \`.env\` file from the example:
\`\`\`bash
cp .env.example .env
\`\`\`

3. Add your bot token to \`.env\`:
\`\`\`
BOT_TOKEN=your_bot_token_here
\`\`\`

4. Get your bot token from [@BotFather](https://t.me/botfather) on Telegram.

## Running

Development (with hot reload):
\`\`\`bash
bun run dev
\`\`\`

Production:
\`\`\`bash
bun run start
\`\`\`

## Features

- Basic command handling (\`/start\`, \`/help\`)
- Echo messages
- TypeScript support
- Environment variable configuration
- Graceful shutdown handling
`;
    
    fs.writeFileSync(path.join(projectPath, 'README.md'), readmeContent);
    
    console.log('📦 Installing dependencies...');
    execSync('bun install', { cwd: projectPath, stdio: 'inherit' });
    
    // Apply selected features
    if (options.features && options.features.length > 0) {
      console.log('\\n🎛️ Setting up selected features...');
      
      if (options.features.includes('webhook')) {
        console.log('🌐 Adding webhook support...');
        const framework = options.framework || 'fastify';
        execSync(`node ../bin/add-webhook.js --framework ${framework}`, { cwd: projectPath, stdio: 'inherit' });
      }
      
      if (options.features.includes('scenes')) {
        console.log('🎭 Adding scenes/wizards support...');
        execSync('node ../bin/add-scenes.js', { cwd: projectPath, stdio: 'inherit' });
      }
    }
    
    console.log('✅ Project created successfully!');
    console.log(`\n📁 cd ${projectName}`);
    
    if (options.token) {
      console.log('🚀 bun run dev');
    } else {
      console.log('🔧 cp .env.example .env');
      console.log('🤖 Add your bot token to .env');
      console.log('🚀 bun run dev');
    }
    
  } catch (error) {
    console.error('❌ Error creating project:', error.message);
    // Clean up on error
    if (fs.existsSync(projectPath)) {
      fs.rmSync(projectPath, { recursive: true, force: true });
    }
    process.exit(1);
  }
}

const { projectName, options } = parseArgs();
createTelebot(projectName, options).catch(error => {
  console.error('❌ Error creating project:', error.message);
  process.exit(1);
});