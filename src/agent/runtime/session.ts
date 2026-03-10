import { contextManager } from './context';
import { workspaceManager } from '../../core/workspace';

interface Session {
  id: string;
  channelId: string;
  userId: string;
  workspaceId: string;
}

export class SessionManager {
  private sessions: Map<string, Session> = new Map();
  // Map (channelId:userId) -> sessionId
  private userSessionMap: Map<string, string> = new Map();

  /**
   * Retrieves or creates a session for a given user on a specific channel.
   * If no workspace is bound, it defaults to the default workspace.
   */
  public getSession(channelId: string, userId: string): Session {
    const key = this.getSessionKey(channelId, userId);
    let sessionId = this.userSessionMap.get(key);

    if (sessionId) {
      const session = this.sessions.get(sessionId);
      if (session) return session;
    }

    // Create new session
    const defaultWorkspace = workspaceManager.getActiveWorkspace()?.id || 'default';
    const context = contextManager.createSession();
    sessionId = context.sessionId;

    const newSession: Session = {
      id: sessionId,
      channelId,
      userId,
      workspaceId: defaultWorkspace
    };

    this.sessions.set(sessionId, newSession);
    this.userSessionMap.set(key, sessionId);

    return newSession;
  }

  /**
   * Binds a session to a specific workspace.
   */
  public switchWorkspace(sessionId: string, workspaceId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Verify workspace exists
    const workspace = workspaceManager.getWorkspace(workspaceId);
    if (!workspace) {
      throw new Error(`Workspace ${workspaceId} not found`);
    }

    session.workspaceId = workspaceId;
    
    // Note: In a real implementation, we might want to switch the context history 
    // or keep it but annotate the workspace switch event.
    // For now, we keep the history continuous.
    contextManager.addMessage(sessionId, 'system', `Switched to workspace: ${workspace.name}`);
  }

  private getSessionKey(channelId: string, userId: string): string {
    return `${channelId}:${userId}`;
  }
}

export const sessionManager = new SessionManager();
