import { v4 as uuidv4 } from 'uuid';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface SessionContext {
  sessionId: string;
  messages: Message[];
  metadata: Record<string, any>;
}

export class ContextManager {
  private sessions: Map<string, SessionContext> = new Map();

  public createSession(sessionId?: string): SessionContext {
    const id = sessionId || uuidv4();
    const session: SessionContext = {
      sessionId: id,
      messages: [],
      metadata: {}
    };
    this.sessions.set(id, session);
    return session;
  }

  public getSession(sessionId: string): SessionContext | undefined {
    return this.sessions.get(sessionId);
  }

  public addMessage(sessionId: string, role: Message['role'], content: string): Message {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const message: Message = {
      id: uuidv4(),
      role,
      content,
      timestamp: Date.now()
    };
    session.messages.push(message);
    return message;
  }

  public getHistory(sessionId: string): Message[] {
    const session = this.sessions.get(sessionId);
    return session ? session.messages : [];
  }

  public clearHistory(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.messages = [];
    }
  }
}

export const contextManager = new ContextManager();
