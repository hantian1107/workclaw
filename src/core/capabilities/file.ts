import fs from 'fs/promises';
import path from 'path';
import { sandbox } from '../sandbox';

export class FileCapability {
  /**
   * Reads a file content after verifying permissions.
   */
  async read(filePath: string): Promise<string> {
    const safePath = sandbox.validatePath(filePath, 'read');
    return fs.readFile(safePath, 'utf-8');
  }

  /**
   * Writes content to a file after verifying permissions.
   */
  async write(filePath: string, content: string): Promise<void> {
    const safePath = sandbox.validatePath(filePath, 'write');
    await fs.writeFile(safePath, content, 'utf-8');
  }

  /**
   * Lists files in a directory after verifying permissions.
   */
  async list(dirPath: string): Promise<string[]> {
    const safePath = sandbox.validatePath(dirPath, 'read');
    return fs.readdir(safePath);
  }

  /**
   * Checks if a file or directory exists.
   */
  async exists(filePath: string): Promise<boolean> {
    try {
      const safePath = sandbox.validatePath(filePath, 'read');
      await fs.access(safePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Creates a directory.
   */
  async mkdir(dirPath: string): Promise<void> {
    const safePath = sandbox.validatePath(dirPath, 'write');
    await fs.mkdir(safePath, { recursive: true });
  }
}

export const fileCapability = new FileCapability();
