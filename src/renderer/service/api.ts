interface Message {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  title: string;
  workspaceId?: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

interface ConversationInfo {
  id: string;
  title: string;
  lastMessage: string;
  lastMessageTime: string;
  messageCount: number;
  workspaceId?: string;
  createdAt: string;
}

interface Workspace {
  id: string;
  name: string;
  description: string;
  resources: Resource[];
  createdAt: string;
  updatedAt: string;
}

interface Resource {
  path: string;
  type: 'file' | 'directory' | 'app';
  permissions: 'read' | 'write' | 'execute' | 'all';
}

interface AgentMessage {
  id: string;
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

class RendererAPI {
  sendMessage(message: any): void {
    if (window.electron) {
      window.electron.sendMessage(message);
    }
  }

  onMessage(callback: (message: AgentMessage) => void): void {
    if (window.electron) {
      window.electron.onMessage(callback);
    }
  }

  workspace = {
    create: async (name: string, description: string): Promise<Workspace> => {
      if (window.electron && window.electron.workspace) {
        return await window.electron.workspace.create(name, description);
      }
      throw new Error('Electron API not available');
    },

    list: async (): Promise<Workspace[]> => {
      if (window.electron && window.electron.workspace) {
        return await window.electron.workspace.list();
      }
      throw new Error('Electron API not available');
    },

    get: async (id: string): Promise<Workspace | null> => {
      if (window.electron && window.electron.workspace) {
        return await window.electron.workspace.get(id);
      }
      throw new Error('Electron API not available');
    },

    update: async (id: string, updates: any): Promise<Workspace | null> => {
      if (window.electron && window.electron.workspace) {
        return await window.electron.workspace.update(id, updates);
      }
      throw new Error('Electron API not available');
    },

    delete: async (id: string): Promise<boolean> => {
      if (window.electron && window.electron.workspace) {
        return await window.electron.workspace.delete(id);
      }
      throw new Error('Electron API not available');
    },

    switch: async (id: string): Promise<boolean> => {
      if (window.electron && window.electron.workspace) {
        return await window.electron.workspace.switch(id);
      }
      throw new Error('Electron API not available');
    },

    addResource: async (workspaceId: string, resource: Resource): Promise<boolean> => {
      if (window.electron && window.electron.workspace) {
        return await window.electron.workspace.addResource(workspaceId, resource);
      }
      throw new Error('Electron API not available');
    },

    removeResource: async (workspaceId: string, resourcePath: string): Promise<boolean> => {
      if (window.electron && window.electron.workspace) {
        return await window.electron.workspace.removeResource(workspaceId, resourcePath);
      }
      throw new Error('Electron API not available');
    }
  };

  conversation = {
    create: async (title: string, workspaceId?: string): Promise<Conversation> => {
      if (window.electron && window.electron.conversation) {
        return await window.electron.conversation.create(title, workspaceId);
      }
      throw new Error('Electron API not available');
    },

    list: async (workspaceId?: string): Promise<ConversationInfo[]> => {
      if (window.electron && window.electron.conversation) {
        return await window.electron.conversation.list(workspaceId);
      }
      throw new Error('Electron API not available');
    },

    get: async (conversationId: string): Promise<Conversation | null> => {
      if (window.electron && window.electron.conversation) {
        return await window.electron.conversation.get(conversationId);
      }
      throw new Error('Electron API not available');
    },

    updateTitle: async (conversationId: string, title: string): Promise<boolean> => {
      if (window.electron && window.electron.conversation) {
        return await window.electron.conversation.updateTitle(conversationId, title);
      }
      throw new Error('Electron API not available');
    },

    delete: async (conversationId: string): Promise<boolean> => {
      if (window.electron && window.electron.conversation) {
        return await window.electron.conversation.delete(conversationId);
      }
      throw new Error('Electron API not available');
    },

    clear: async (conversationId: string): Promise<boolean> => {
      if (window.electron && window.electron.conversation) {
        return await window.electron.conversation.clear(conversationId);
      }
      throw new Error('Electron API not available');
    }
  };
}

export const api = new RendererAPI();
export type { Message, Conversation, ConversationInfo, Workspace, Resource, AgentMessage };
