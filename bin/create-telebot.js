#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createTelebot(projectName) {
  if (!projectName) {
    console.error('❌ Please provide a project name');
    console.log('Usage: create-telebot <project-name>');
    process.exit(1);
  }

  const projectPath = path.resolve(projectName);
  
  if (fs.existsSync(projectPath)) {
    console.error(`❌ Directory ${projectName} already exists`);
    process.exit(1);
  }

  console.log(`🚀 Creating Telegram bot project: ${projectName}`);
  
  try {
    // Create project directory
    fs.mkdirSync(projectPath, { recursive: true });
    
    // Copy template files
    const templatePath = path.resolve(__dirname, '..');
    const filesToCopy = [
      'index.ts',
      'package.json',
      'tsconfig.json',
      '.env.example',
      '.gitignore'
    ];
    
    filesToCopy.forEach(file => {
      const srcPath = path.join(templatePath, file);
      const destPath = path.join(projectPath, file);
      
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
    
    console.log('✅ Project created successfully!');
    console.log(`\n📁 cd ${projectName}`);
    console.log('🔧 cp .env.example .env');
    console.log('🤖 Add your bot token to .env');
    console.log('🚀 bun run dev');
    
  } catch (error) {
    console.error('❌ Error creating project:', error.message);
    // Clean up on error
    if (fs.existsSync(projectPath)) {
      fs.rmSync(projectPath, { recursive: true, force: true });
    }
    process.exit(1);
  }
}

const projectName = process.argv[2];
createTelebot(projectName);