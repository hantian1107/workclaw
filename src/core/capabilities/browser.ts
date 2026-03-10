import { shell } from 'electron';
import { sandbox } from '../sandbox';

/**
 * 浏览器控制能力
 * 提供打开 URL、搜索等基本功能
 */
export class BrowserCapability {
  /**
   * 在默认浏览器中打开 URL
   */
  async open(url: string): Promise<void> {
    // 验证 URL 安全性
    if (!this.isValidUrl(url)) {
      throw new Error(`Invalid or unsafe URL: ${url}`);
    }
    
    // 调用 Electron shell API
    await shell.openExternal(url);
  }

  /**
   * 使用默认搜索引擎搜索关键词
   */
  async search(query: string, engine: 'google' | 'bing' | 'baidu' = 'google'): Promise<void> {
    const engines = {
      google: 'https://www.google.com/search?q=',
      bing: 'https://www.bing.com/search?q=',
      baidu: 'https://www.baidu.com/s?wd=',
    };
    
    const searchUrl = `${engines[engine]}${encodeURIComponent(query)}`;
    await this.open(searchUrl);
  }

  /**
   * 简单的 URL 验证
   */
  private isValidUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }
}

export const browserCapability = new BrowserCapability();
