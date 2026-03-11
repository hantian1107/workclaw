interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

class ConversationManager {
  private conversations: Map<string, Message[]> = new Map();

  addMessage(sessionId: string, role: 'user' | 'assistant' | 'system', content: string): void {
    if (!this.conversations.has(sessionId)) {
      this.conversations.set(sessionId, []);
    }
    
    const conversation = this.conversations.get(sessionId);
    if (conversation) {
      conversation.push({
        role,
        content,
        timestamp: new Date().toISOString()
      });
    }
  }

  getConversation(sessionId: string): Message[] {
    return this.conversations.get(sessionId) || [];
  }

  getRecentMessages(sessionId: string, limit: number = 10): Message[] {
    const conversation = this.getConversation(sessionId);
    return conversation.slice(-limit);
  }

  clearConversation(sessionId: string): void {
    this.conversations.delete(sessionId);
  }

  exportConversation(sessionId: string): string {
    const conversation = this.getConversation(sessionId);
    return JSON.stringify(conversation, null, 2);
  }

  importConversation(sessionId: string, conversation: Message[]): void {
    this.conversations.set(sessionId, conversation);
  }

  getSessionIds(): string[] {
    return Array.from(this.conversations.keys());
  }

  pruneInactiveConversations(maxAgeMs: number = 24 * 60 * 60 * 1000): void {
    const now = new Date().getTime();
    for (const [sessionId, conversation] of this.conversations.entries()) {
      if (conversation.length === 0) {
        this.conversations.delete(sessionId);
        continue;
      }
      
      const lastMessage = conversation[conversation.length - 1];
      const lastTimestamp = new Date(lastMessage.timestamp).getTime();
      if (now - lastTimestamp > maxAgeMs) {
        this.conversations.delete(sessionId);
      }
    }
  }
}

export { ConversationManager };
export type { Message };
