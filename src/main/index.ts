import { app, BrowserWindow } from 'electron';
import { createWindow } from './window';
import { IPCChannel } from '../channels/ipc';
import { FeishuChannel } from '../channels/feishu';
import { Agent } from '../agent/agent';
import { Core } from '../core/core';
import { WorkspaceManager } from '../workspace/workspace';
import { MainAPI } from './service/api';

class Application {
  private mainWindow: BrowserWindow | null = null;
  private ipcChannel: IPCChannel;
  private feishuChannel: FeishuChannel;
  private agent: Agent;
  private core: Core;
  private workspaceManager: WorkspaceManager;
  private mainAPI: MainAPI;

  constructor() {
    this.ipcChannel = new IPCChannel();
    this.feishuChannel = new FeishuChannel();
    this.workspaceManager = new WorkspaceManager();
    this.core = new Core(this.workspaceManager);
    this.agent = new Agent();
    this.mainAPI = new MainAPI();

    this.setupEventListeners();
    this.setupChannels();
  }

  private setupEventListeners(): void {
    app.on('ready', this.createMainWindow.bind(this));
    app.on('window-all-closed', this.handleWindowAllClosed.bind(this));
    app.on('activate', this.handleActivate.bind(this));
  }

  private setupChannels(): void {
    // 启动IPC通道
    this.ipcChannel.start();
    this.ipcChannel.onMessage(this.handleMessage.bind(this));

    // 启动飞书通道（预留功能）
    this.feishuChannel.start();
    this.feishuChannel.onMessage(this.handleMessage.bind(this));
  }

  private async handleMessage(message: any): Promise<void> {
    try {
      // 处理用户消息
      const response = await this.agent.processMessage(message.content, message.userId);
      
      // 发送响应回通道
      const agentMessage = {
        id: `msg-${Date.now()}`,
        content: response,
        timestamp: new Date().toISOString()
      };
      
      if (message.channelId === 'ipc-channel') {
        this.ipcChannel.sendMessage(agentMessage);
      } else if (message.channelId === 'feishu-channel') {
        this.feishuChannel.sendMessage(agentMessage);
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  private createMainWindow(): void {
    this.mainWindow = createWindow();
  }

  private handleWindowAllClosed(): void {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  }

  private handleActivate(): void {
    if (this.mainWindow === null) {
      this.createMainWindow();
    }
  }
}

// 启动应用
new Application();
