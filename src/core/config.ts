import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * 全局配置接口
 */
export interface AppConfig {
  app: {
    name: string;
    version: string;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
  };
  llm: {
    provider: 'openai' | 'minimax' | 'ollama';
    apiKey: string;
    baseUrl?: string;
    model: string;
  };
  feishu: {
    appId: string;
    appSecret: string;
    verificationToken: string;
    encryptKey: string;
  };
  storage: {
    workspacePath: string;
  };
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: AppConfig = {
  app: {
    name: 'WorkClaw',
    version: '1.0.0',
    logLevel: 'info',
  },
  llm: {
    provider: 'minimax', // 默认使用 Minimax，基于项目历史
    apiKey: process.env.LLM_API_KEY || '',
    model: 'abab5.5-chat',
  },
  feishu: {
    appId: process.env.FEISHU_APP_ID || '',
    appSecret: process.env.FEISHU_APP_SECRET || '',
    verificationToken: process.env.FEISHU_VERIFICATION_TOKEN || '',
    encryptKey: process.env.FEISHU_ENCRYPT_KEY || '',
  },
  storage: {
    workspacePath: path.join(os.homedir(), '.workclaw', 'workspaces'),
  },
};

export class ConfigManager {
  private config: AppConfig;
  private configPath: string;

  constructor() {
    this.configPath = path.join(os.homedir(), '.workclaw', 'config.json');
    this.config = this.loadConfig();
  }

  /**
   * 加载配置，如果不存在则使用默认值并创建文件
   */
  private loadConfig(): AppConfig {
    try {
      if (fs.existsSync(this.configPath)) {
        const fileContent = fs.readFileSync(this.configPath, 'utf-8');
        const userConfig = JSON.parse(fileContent);
        // 深度合并配置 (简单实现)
        return { ...DEFAULT_CONFIG, ...userConfig, llm: { ...DEFAULT_CONFIG.llm, ...userConfig.llm } };
      } else {
        // 创建配置目录
        const configDir = path.dirname(this.configPath);
        if (!fs.existsSync(configDir)) {
          fs.mkdirSync(configDir, { recursive: true });
        }
        // 写入默认配置
        fs.writeFileSync(this.configPath, JSON.stringify(DEFAULT_CONFIG, null, 2));
        return DEFAULT_CONFIG;
      }
    } catch (error) {
      console.error('Failed to load config, using defaults:', error);
      return DEFAULT_CONFIG;
    }
  }

  /**
   * 获取配置
   */
  public getConfig(): AppConfig {
    return this.config;
  }

  /**
   * 更新配置
   */
  public updateConfig(updates: Partial<AppConfig>): void {
    this.config = { ...this.config, ...updates };
    fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
  }
}

export const configManager = new ConfigManager();
