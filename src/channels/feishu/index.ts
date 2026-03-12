import type { IChannel, UserMessage, AgentMessage } from '../base';

class FeishuChannel implements IChannel {
  private channelId: string = 'feishu-channel';
  private messageCallback: ((message: UserMessage) => void) | null = null;

  public simulateIncomingMessage(message: UserMessage) {
    if (this.messageCallback) {
      this.messageCallback(message);
    }
  }

  start(): Promise<void> {
    // 启动HTTP服务器，监听飞书Webhook请求
    // 注意：这是预留功能，实际实现需要启动一个HTTP服务器
    console.log('Feishu channel started (reserved for future implementation)');
    return Promise.resolve();
  }

  stop(): Promise<void> {
    // 停止HTTP服务器
    console.log('Feishu channel stopped');
    return Promise.resolve();
  }

  sendMessage(message: AgentMessage): Promise<void> {
    // 向飞书发送消息
    // 注意：这是预留功能，实际实现需要调用飞书API
    console.log('Sending message to Feishu:', message);
    return Promise.resolve();
  }

  onMessage(callback: (message: UserMessage) => void): void {
    this.messageCallback = callback;
  }

  getChannelId(): string {
    return this.channelId;
  }
}

export { FeishuChannel };
