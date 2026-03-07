interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

class ContextManager {
  private messages: Message[] = [];
  private maxMessages = 50; // 最大消息数，防止上下文过长

  // 添加消息到上下文
  addMessage(role: 'user' | 'assistant', content: string): void {
    this.messages.push({
      role,
      content,
      timestamp: new Date()
    });
    
    // 限制上下文大小
    if (this.messages.length > this.maxMessages) {
      this.messages = this.messages.slice(-this.maxMessages);
    }
  }

  // 获取对话历史
  getHistory(): Message[] {
    return [...this.messages];
  }

  // 获取上下文字符串
  getContextString(): string {
    return this.messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
  }

  // 清空上下文
  clear(): void {
    this.messages = [];
  }

  // 获取最近的消息
  getRecentMessages(count: number): Message[] {
    return this.messages.slice(-count);
  }

  // 检查上下文是否为空
  isEmpty(): boolean {
    return this.messages.length === 0;
  }

  // 获取上下文大小
  size(): number {
    return this.messages.length;
  }
}

export const contextManager = new ContextManager();