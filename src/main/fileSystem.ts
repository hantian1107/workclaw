/**
 * 文件系统服务
 * 提供文件系统相关的操作，如打开文件、保存文件、列出目录内容等
 */
import * as fs from 'fs';
import * as path from 'path';

/**
 * 文件系统服务类
 * 提供文件系统相关的操作方法
 */
class FileSystemService {
  /**
   * 打开文件
   * @param filePath 文件路径
   * @returns Promise<string> 文件内容
   * @throws 如果打开文件失败则抛出错误
   */
  async openFile(filePath: string): Promise<string> {
    try {
      // 读取文件内容
      const content = await fs.promises.readFile(filePath, 'utf8');
      return content;
    } catch (error) {
      console.error('Error opening file:', error);
      throw new Error('Failed to open file');
    }
  }

  /**
   * 保存文件
   * @param filePath 文件路径
   * @param content 文件内容
   * @returns Promise<void>
   * @throws 如果保存文件失败则抛出错误
   */
  async saveFile(filePath: string, content: string): Promise<void> {
    try {
      // 确保目录存在
      const dirPath = path.dirname(filePath);
      if (!fs.existsSync(dirPath)) {
        await fs.promises.mkdir(dirPath, { recursive: true });
      }
      // 写入文件内容
      await fs.promises.writeFile(filePath, content, 'utf8');
    } catch (error) {
      console.error('Error saving file:', error);
      throw new Error('Failed to save file');
    }
  }

  /**
   * 列出目录内容
   * @param dirPath 目录路径
   * @returns Promise<Array<{ name: string; type: 'file' | 'directory'; path: string }>> 目录条目列表
   * @throws 如果列出目录失败则抛出错误
   */
  async listDirectory(dirPath: string): Promise<Array<{ name: string; type: 'file' | 'directory'; path: string }>> {
    try {
      // 读取目录内容
      const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
      // 转换为统一格式
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

  /**
   * 检查文件是否存在
   * @param filePath 文件路径
   * @returns boolean 文件是否存在
   */
  fileExists(filePath: string): boolean {
    return fs.existsSync(filePath);
  }

  /**
   * 获取文件信息
   * @param filePath 文件路径
   * @returns Promise<fs.Stats> 文件信息
   * @throws 如果获取文件信息失败则抛出错误
   */
  async getFileInfo(filePath: string): Promise<fs.Stats> {
    try {
      return await fs.promises.stat(filePath);
    } catch (error) {
      console.error('Error getting file info:', error);
      throw new Error('Failed to get file info');
    }
  }
}

/**
 * 文件系统服务实例
 */
export const fileSystemService = new FileSystemService();