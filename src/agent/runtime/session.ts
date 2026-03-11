// 会话类型定义
export interface Session {
  id: string;           // 会话ID
  createdAt: Date;      // 创建时间
  lastActiveAt: Date;   // 最后活动时间
  metadata?: Record<string, any>; // 会话元数据
}

// 会话管理器类
export class SessionManager {
  private sessions: Map<string, Session>;

  constructor() {
    this.sessions = new Map<string, Session>();
  }

  /**
   * 根据会话ID获取或创建会话
   * @param sessionId 会话ID
   * @returns 会话对象
   */
  getOrCreateSession(sessionId: string): Session {
    if (this.sessions.has(sessionId)) {
      // 更新最后活动时间
      const session = this.sessions.get(sessionId)!;
      session.lastActiveAt = new Date();
      this.sessions.set(sessionId, session);
      return session;
    } else {
      // 创建新会话
      const newSession: Session = {
        id: sessionId,
        createdAt: new Date(),
        lastActiveAt: new Date(),
        metadata: {}
      };
      this.sessions.set(sessionId, newSession);
      return newSession;
    }
  }

  /**
   * 根据会话ID获取会话
   * @param sessionId 会话ID
   * @returns 会话对象，如果不存在则返回undefined
   */
  getSession(sessionId: string): Session | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * 删除会话
   * @param sessionId 会话ID
   * @returns 是否删除成功
   */
  deleteSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  /**
   * 获取所有会话
   * @returns 会话对象数组
   */
  getAllSessions(): Session[] {
    return Array.from(this.sessions.values());
  }

  /**
   * 清理过期会话
   * @param maxAge 最大会话年龄（毫秒）
   * @returns 清理的会话数量
   */
  cleanupExpiredSessions(maxAge: number = 24 * 60 * 60 * 1000): number {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastActiveAt.getTime() > maxAge) {
        this.sessions.delete(sessionId);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  /**
   * 更新会话元数据
   * @param sessionId 会话ID
   * @param metadata 要更新的元数据
   * @returns 是否更新成功
   */
  updateSessionMetadata(sessionId: string, metadata: Record<string, any>): boolean {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.metadata = { ...session.metadata, ...metadata };
      session.lastActiveAt = new Date();
      this.sessions.set(sessionId, session);
      return true;
    }
    return false;
  }
}