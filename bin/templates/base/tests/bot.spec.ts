import { expect, test } from 'bun:test';
import fs from 'fs';
import path from 'path';

const root = path.join(__dirname, '..');

test('env example includes BOT_TOKEN', () => {
  const envPath = path.join(root, '.env.example');
  const env = fs.readFileSync(envPath, 'utf8');
  expect(env).toContain('BOT_TOKEN=');
  expect(env).toContain('LOCALE=');
  expect(env).toContain('RATE_LIMIT_MAX=');
});

test('index.ts contains basic commands', () => {
  const indexPath = path.join(root, 'src', 'index.ts');
  const content = fs.readFileSync(indexPath, 'utf8');
  expect(content).toContain('bot.start');
  expect(content).toContain('bot.help');
  expect(content).toContain('bot.command(\'menu\'');
  expect(content).toContain('bot.command(\'lang\'');
  expect(content).toContain('setMyCommands');
  expect(content).toContain('rateLimits');
});
