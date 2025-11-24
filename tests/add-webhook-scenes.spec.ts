import { expect, test } from 'bun:test';
import fs from 'fs';
import path from 'path';

const projectRoot = path.join(__dirname, '..');
const templatesRoot = path.join(projectRoot, 'bin', 'templates', 'base');

function readTemplate(file) {
  return fs.readFileSync(path.join(templatesRoot, file), 'utf8');
}

test('add-webhook template contains webhook path and health', () => {
  const server = fs.readFileSync(path.join(projectRoot, 'bin', 'add-webhook.js'), 'utf8');
  expect(server).toContain('WEBHOOK_PATH');
  expect(server).toContain('/health');
});

test('scenes template exists and includes wizard scene', () => {
  const scenesPath = path.join(projectRoot, 'bin', 'add-scenes.js');
  const content = fs.readFileSync(scenesPath, 'utf8');
  expect(content).toContain('WizardScene');
  expect(content).toContain('myScene');
});

test('base template index has BOT_TOKEN guard', () => {
  const indexContent = readTemplate('src/index.ts');
  expect(indexContent).toContain('BOT_TOKEN');
  expect(indexContent).toContain('process.exit(1)');
});
