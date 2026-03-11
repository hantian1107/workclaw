import  { ipcMain, BrowserWindow } from 'electron';
import type { IpcMainEvent } from 'electron';
import type { IChannel, UserMessage, AgentMessage } from '../base';

class IPCChannel implements IChannel {
  private channelId: string = 'ipc-channel';
  private messageCallback: ((message: UserMessage) => void) | null = null;

  start(): Promise<void> {
    // 监听来自渲染进程的消息
    ipcMain.on('message', this.handleMessage.bind(this));
    return Promise.resolve();
  }

  stop(): Promise<void> {
    // 移除监听器
    ipcMain.removeListener('message', this.handleMessage.bind(this));
    return Promise.resolve();
  }

  sendMessage(message: AgentMessage): Promise<void> {
    // 向所有渲染进程发送消息
    // 注意：在实际实现中，应该根据会话ID发送到特定的窗口
    // 这里简化处理，发送到所有窗口
    const windows = BrowserWindow.getAllWindows();
    windows.forEach(window => {
      if (window.webContents) {
        window.webContents.send('message', message);
      }
    });
    return Promise.resolve();
  }

  onMessage(callback: (message: UserMessage) => void): void {
    this.messageCallback = callback;
  }

  getChannelId(): string {
    return this.channelId;
  }

  private handleMessage(_event: IpcMainEvent, message: any): void {
    if (this.messageCallback) {
      const userMessage: UserMessage = {
        id: message.id || `msg-${Date.now()}`,
        content: message.content,
        userId: message.userId || 'local-user',
        timestamp: message.timestamp || new Date().toISOString(),
        metadata: message.metadata
      };
      this.messageCallback(userMessage);
    }
  }
}

export { IPCChannel };
