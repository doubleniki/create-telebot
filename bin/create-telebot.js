#!/usr/bin/env node

import { execSync, spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import prompts from 'prompts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SUPPORTED_PACKAGE_MANAGERS = ['bun', 'npm', 'pnpm', 'yarn'];
const TEMPLATE_PATH = path.join(__dirname, 'templates', 'base');
let USE_EMOJI = true;
let USE_COLOR = true;

function normalizePackageManager(pm) {
  const candidate = (pm || '').toLowerCase();
  if (SUPPORTED_PACKAGE_MANAGERS.includes(candidate)) return candidate;
  console.warn(`⚠️ Unsupported package manager "${pm}", defaulting to bun.`);
  return 'bun';
}

function ensurePackageManagerAvailable(packageManager) {
  const check = spawnSync(packageManager, ['--version'], { stdio: 'ignore' });
  if (check.error) {
    throw new Error(
      `Package manager "${packageManager}" is not available in PATH. Install it or choose another with --package-manager.`
    );
  }
}

function installDependencies(packageManager, cwd) {
  const commands = {
    bun: 'bun install',
    npm: 'npm install',
    pnpm: 'pnpm install',
    yarn: 'yarn install',
  };
  const command = commands[packageManager];
  if (!command) {
    throw new Error(`Unsupported package manager: ${packageManager}`);
  }

  console.log(`${USE_EMOJI ? '📦 ' : ''}Installing dependencies with ${packageManager}...`);
  execSync(command, { cwd, stdio: 'inherit' });
}

function collectTemplateEntries(srcDir, prefix = '') {
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const rel = path.join(prefix, entry.name);
    if (entry.isDirectory()) {
      return collectTemplateEntries(path.join(srcDir, entry.name), rel);
    }
    return [rel];
  });
}

function copyTemplateDir(srcDir, destDir, projectName) {
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  entries.forEach((entry) => {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyTemplateDir(srcPath, destPath, projectName);
    } else if (entry.isFile()) {
      let content = fs.readFileSync(srcPath, 'utf8');
      if (entry.name === 'package.json') {
        const pkg = JSON.parse(content);
        pkg.name = projectName;
        content = JSON.stringify(pkg, null, 2);
      }
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.writeFileSync(destPath, content);
    }
  });
}

function formatPreview(title, content, maxLines = 20) {
  const lines = content.split('\n').slice(0, maxLines);
  return [`--- ${title} (preview) ---`, ...lines, '--- end ---'].join('\n');
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    token: null,
    interactive: true,
    packageManager: 'bun',
    skipInstall: false,
    framework: 'fastify',
    dryRun: false,
    noEmoji: false,
    noColor: false,
    verbose: false,
    template: null,
    envFrom: null,
  };
  let projectName = null;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--token' && i + 1 < args.length) {
      options.token = args[i + 1];
      i++;
    } else if (arg === '--package-manager' && i + 1 < args.length) {
      options.packageManager = args[i + 1];
      i++;
    } else if (arg === '--skip-install') {
      options.skipInstall = true;
    } else if (arg === '--framework' && i + 1 < args.length) {
      options.framework = args[i + 1];
      i++;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--no-emoji') {
      options.noEmoji = true;
    } else if (arg === '--no-color') {
      options.noColor = true;
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg === '--template' && i + 1 < args.length) {
      options.template = args[i + 1];
      i++;
    } else if (arg === '--env-from' && i + 1 < args.length) {
      options.envFrom = args[i + 1];
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
  --package-manager    Choose bun|npm|pnpm|yarn (default: bun)
  --skip-install       Skip dependency installation
  --template <path>    Use custom template directory instead of built-in
  --env-from <file>    Prefill .env from a file (copies key/values)
  --framework          Webhook framework when adding webhook (fastify|hono)
  --dry-run            Show planned actions without writing files
  --no-emoji           Disable emoji in output
  --no-color           Disable color output
  --verbose, -v        Verbose output (with dry-run shows file previews)
  --no-interactive     Skip interactive setup
  --help, -h           Show this help message

Examples:
  create-telebot my-bot
  create-telebot my-bot --token "123456789:ABCdefGHIjklMNOpqrstUVwxyz"
  create-telebot my-bot --package-manager pnpm --skip-install
  create-telebot my-bot --dry-run
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
    },
    {
      type: 'select',
      name: 'packageManager',
      message: 'Choose package manager for installation:',
      choices: [
        { title: 'Bun', value: 'bun' },
        { title: 'npm', value: 'npm' },
        { title: 'pnpm', value: 'pnpm' },
        { title: 'yarn', value: 'yarn' }
      ],
      initial: 0
    },
    {
      type: 'toggle',
      name: 'skipInstall',
      message: 'Skip dependency installation?',
      active: 'yes',
      inactive: 'no',
      initial: false
    },
    {
      type: 'text',
      name: 'template',
      message: 'Custom template directory (optional):',
      initial: ''
    },
    {
      type: 'text',
      name: 'envFrom',
      message: 'Path to .env source file to prefill (optional):',
      initial: ''
    },
    {
      type: 'toggle',
      name: 'noColor',
      message: 'Disable color output?',
      active: 'yes',
      inactive: 'no',
      initial: false
    },
    {
      type: 'toggle',
      name: 'noEmoji',
      message: 'Disable emoji in output?',
      active: 'yes',
      inactive: 'no',
      initial: false
    }
  ];

  return await prompts(questions);
}

async function createTelebot(projectName, options = {}) {
  if (!projectName) {
    console.error(`${USE_EMOJI ? '❌ ' : ''}Please provide a project name`);
    showHelp();
    process.exit(1);
  }

  const projectPath = path.resolve(projectName);
  
  if (fs.existsSync(projectPath)) {
    console.error(`${USE_EMOJI ? '❌ ' : ''}Directory ${projectName} already exists`);
    process.exit(1);
  }

  console.log(`${USE_EMOJI ? '🚀 ' : ''}Creating Telegram bot project: ${projectName}`);
  
  // Get interactive options if not disabled
  let interactiveOptions = {};
  if (options.interactive) {
    console.log(`\n${USE_EMOJI ? '📋 ' : ''}Let's set up your bot with some options:\n`);
    interactiveOptions = await getInteractiveOptions();
    
    // Merge interactive options with CLI options (CLI takes precedence)
    options = { ...interactiveOptions, ...options };
  }

  options.packageManager = normalizePackageManager(options.packageManager);
  options.features = options.features || [];
  options.framework = (options.framework || 'fastify').toLowerCase();
  if (!['fastify', 'hono'].includes(options.framework)) {
    console.warn(`⚠️ Unknown framework "${options.framework}", defaulting to fastify.`);
    options.framework = 'fastify';
  }
  USE_EMOJI = !options.noEmoji;
  USE_COLOR = !options.noColor;
  const templateDir = options.template
    ? path.resolve(options.template)
    : TEMPLATE_PATH;

  if (!options.skipInstall && !options.dryRun) {
    try {
      ensurePackageManagerAvailable(options.packageManager);
    } catch (error) {
      console.error(`❌ ${error.message}`);
      process.exit(1);
    }
  }

  try {
    if (!fs.existsSync(templateDir)) {
      throw new Error(`Template path not found: ${templateDir}`);
    }

    if (options.dryRun) {
      console.log(`${USE_EMOJI ? '🧪 ' : ''}Dry run enabled. Planned actions:`);
      console.log(`- Create project directory: ${projectPath}`);
      console.log(`- Copy template from: ${templateDir}`);
      const templateFiles = collectTemplateEntries(templateDir);
      console.log(`- Files to create (${templateFiles.length}):`);
      templateFiles.forEach((file) => console.log(`  - ${file}`));
      console.log(`- Package manager: ${options.packageManager} (${options.skipInstall ? 'skip install' : 'install deps'})`);
      if (options.features.length > 0) {
        console.log(`- Apply features: ${options.features.join(', ')} (framework: ${options.framework})`);
      }
      if (options.token) {
        console.log('- Create .env with provided token');
      }
      console.log('- Generate README.md with setup instructions');
      if (options.verbose) {
        const installCommand = options.packageManager === 'bun' ? 'bun install' : `${options.packageManager} install`;
        const readmePreview = `# ${projectName}\n\nA Telegram bot built with Bun and Telegraf.\n\nInstall: ${installCommand}\nFeatures: start/help/echo\nWebhook: optional (Fastify/Hono)\nScenes: optional wizard`;
        const pkgPath = path.join(templateDir, 'package.json');
        const pkgContent = fs.readFileSync(pkgPath, 'utf8');
        console.log(formatPreview('README', readmePreview, 12));
        console.log(formatPreview('package.json', pkgContent, 12));
      }
      return;
    }

    // Create project directory
    fs.mkdirSync(projectPath, { recursive: true });

    // Copy template files recursively
    copyTemplateDir(templateDir, projectPath, projectName);
    
    // Create .env file with token if provided
    const envPath = path.join(projectPath, '.env');
    if (options.envFrom) {
      const srcEnv = path.resolve(options.envFrom);
      if (!fs.existsSync(srcEnv)) {
        throw new Error(`Env source file not found: ${srcEnv}`);
      }
      fs.copyFileSync(srcEnv, envPath);
      console.log(`${USE_EMOJI ? '🔑 ' : ''}.env prefilled from ${srcEnv}`);
    } else if (options.token) {
      const envContent = `BOT_TOKEN=${options.token}`;
      fs.writeFileSync(envPath, envContent);
      console.log(`${USE_EMOJI ? '🔑 ' : ''}Bot token added to .env file`);
    }
    
    // Create README for the new project
    const installCommand = options.packageManager === 'bun' ? 'bun install' : `${options.packageManager} install`;
    const readmeContent = `# ${projectName}

A Telegram bot built with Bun and Telegraf.

## Setup

1. Install dependencies:
\`\`\`bash
${installCommand}
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
    
    if (options.skipInstall) {
      console.log(`${USE_EMOJI ? '⏭️  ' : ''}Skipping dependency installation (per --skip-install)`);
    } else {
      installDependencies(options.packageManager, projectPath);
    }
    
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
    
    console.log(`${USE_EMOJI ? '✅ ' : ''}Project created successfully!`);
    console.log(`\n${USE_EMOJI ? '📁 ' : ''}cd ${projectName}`);
    if (options.skipInstall) {
      const installHint = options.packageManager === 'bun' ? 'bun install' : `${options.packageManager} install`;
      console.log(`${USE_EMOJI ? '📦 ' : ''}${installHint}`);
    }
    if (!options.token) {
      console.log(`${USE_EMOJI ? '🔧 ' : ''}cp .env.example .env`);
      console.log(`${USE_EMOJI ? '🤖 ' : ''}Add your bot token to .env`);
    }
    console.log(`${USE_EMOJI ? '🚀 ' : ''}bun run dev`);
    
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
