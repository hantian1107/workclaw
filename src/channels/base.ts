interface UserMessage {
  id: string;
  content: string;
  userId: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface AgentMessage {
  id: string;
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface IChannel {
  start(): Promise<void>;
  stop(): Promise<void>;
  sendMessage(message: AgentMessage): Promise<void>;
  onMessage(callback: (message: UserMessage) => void): void;
  getChannelId(): string;
}

export { IChannel, UserMessage, AgentMessage };
