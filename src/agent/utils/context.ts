class ContextManager {
  private contexts: Map<string, any> = new Map();

  getContext(sessionId: string): any {
    if (!this.contexts.has(sessionId)) {
      this.contexts.set(sessionId, {
        conversationHistory: [],
        workspaceId: null,
        userPreferences: {},
        lastInteraction: new Date().toISOString()
      });
    }
    return this.contexts.get(sessionId);
  }

  updateContext(sessionId: string, updates: any): void {
    const context = this.getContext(sessionId);
    this.contexts.set(sessionId, {
      ...context,
      ...updates,
      lastInteraction: new Date().toISOString()
    });
  }

  setWorkspace(sessionId: string, workspaceId: string): void {
    this.updateContext(sessionId, { workspaceId });
  }

  clearContext(sessionId: string): void {
    this.contexts.delete(sessionId);
  }

  getSessionIds(): string[] {
    return Array.from(this.contexts.keys());
  }

  pruneInactiveSessions(maxAgeMs: number = 24 * 60 * 60 * 1000): void {
    const now = new Date().getTime();
    for (const [sessionId, context] of this.contexts.entries()) {
      const lastInteraction = new Date(context.lastInteraction).getTime();
      if (now - lastInteraction > maxAgeMs) {
        this.contexts.delete(sessionId);
      }
    }
  }
}

export { ContextManager };
