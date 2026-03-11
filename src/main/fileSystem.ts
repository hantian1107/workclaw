import * as fs from 'fs';
import * as path from 'path';

class FileSystemService {
  // 打开文件
  async openFile(filePath: string): Promise<string> {
    try {
      const content = await fs.promises.readFile(filePath, 'utf8');
      return content;
    } catch (error) {
      console.error('Error opening file:', error);
      throw new Error('Failed to open file');
    }
  }

  // 保存文件
  async saveFile(filePath: string, content: string): Promise<void> {
    try {
      // 确保目录存在
      const dirPath = path.dirname(filePath);
      if (!fs.existsSync(dirPath)) {
        await fs.promises.mkdir(dirPath, { recursive: true });
      }
      await fs.promises.writeFile(filePath, content, 'utf8');
    } catch (error) {
      console.error('Error saving file:', error);
      throw new Error('Failed to save file');
    }
  }

  // 列出目录内容
  async listDirectory(dirPath: string): Promise<Array<{ name: string; type: 'file' | 'directory'; path: string }>> {
    try {
      const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
      return entries.map((entry: fs.Dirent) => ({
        name: entry.name,
        type: entry.isDirectory() ? 'directory' : 'file',
        path: path.join(dirPath, entry.name)
      }));
    } catch (error) {
      console.error('Error listing directory:', error);
      throw new Error('Failed to list directory');
    }
  }

  // 检查文件是否存在
  fileExists(filePath: string): boolean {
    return fs.existsSync(filePath);
  }

  // 获取文件信息
  async getFileInfo(filePath: string): Promise<fs.Stats> {
    try {
      return await fs.promises.stat(filePath);
    } catch (error) {
      console.error('Error getting file info:', error);
      throw new Error('Failed to get file info');
    }
  }
}

export const fileSystemService = new FileSystemService();