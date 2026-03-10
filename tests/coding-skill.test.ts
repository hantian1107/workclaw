import { codingSkill } from '../src/agent/skills/coding/index.js';
import * as path from 'path';
import * as fs from 'fs/promises';
import { workspaceManager } from '../src/core/workspace.js';
import { jest } from '@jest/globals';

// Mock workspace manager behavior
jest.spyOn(workspaceManager, 'getActiveWorkspace').mockReturnValue({
  id: 'test-workspace',
  name: 'Test',
  resources: [{ path: process.cwd(), type: 'folder' }]
});

describe('Coding Skill Integration', () => {
  const testFile = path.join(process.cwd(), 'test-file.txt');

  afterEach(async () => {
    try {
      await fs.unlink(testFile);
    } catch {}
  });

  test('should write and read file', async () => {
    const writeResult = await codingSkill.execute({
      action: 'write',
      path: testFile,
      content: 'Hello World'
    }, {});
    expect(writeResult).toContain('Successfully wrote');

    const content = await fs.readFile(testFile, 'utf-8');
    expect(content).toBe('Hello World');

    const readResult = await codingSkill.execute({
      action: 'read',
      path: testFile
    }, {});
    expect(readResult).toBe('Hello World');
  });

  test('should list files', async () => {
    const listResult = await codingSkill.execute({
      action: 'list',
      path: process.cwd()
    }, {});
    expect(Array.isArray(listResult)).toBe(true);
    expect(listResult).toContain('package.json');
  });
});
