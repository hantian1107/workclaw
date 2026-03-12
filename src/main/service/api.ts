import { ipcMain } from 'electron';
import type { IpcMainInvokeEvent } from 'electron';

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

/*
interface Workspace {
  id: string;
  name: string;
  description: string;
  resources: any[];
  createdAt: string;
  updatedAt: string;
}
*/

class MainAPI {
  /*
  private mockWorkspaces: Workspace[] = [
    {
      id: 'workspace-1',
      name: '默认工作空间',
      description: '这是默认的工作空间',
      resources: [],
      createdAt: '2026-03-01T10:00:00.000Z',
      updatedAt: '2026-03-12T10:00:00.000Z'
    },
    {
      id: 'workspace-2',
      name: '项目 A',
      description: '项目 A 的开发工作空间',
      resources: [],
      createdAt: '2026-03-05T14:30:00.000Z',
      updatedAt: '2026-03-12T10:00:00.000Z'
    }
  ];
  */

  private mockConversations: Conversation[] = [
    {
      id: 'conv-1',
      title: 'Python 编程帮助',
      workspaceId: 'workspace-1',
      messages: [
        {
          id: 'msg-1',
          role: 'user',
          content: '你好，能帮我写一个 Python 脚本吗？',
          timestamp: '2026-03-12T09:00:00.000Z'
        },
        {
          id: 'msg-2',
          role: 'assistant',
          content: '好的！这是一个简单的 Python 脚本示例：\n\n```python\nprint("Hello, World!")\n```',
          timestamp: '2026-03-12T09:00:01.000Z'
        }
      ],
      createdAt: '2026-03-12T09:00:00.000Z',
      updatedAt: '2026-03-12T09:00:01.000Z'
    },
    {
      id: 'conv-2',
      title: 'React 组件设计',
      workspaceId: 'workspace-2',
      messages: [
        {
          id: 'msg-3',
          role: 'user',
          content: '如何设计一个可复用的按钮组件？',
          timestamp: '2026-03-11T15:30:00.000Z'
        },
        {
          id: 'msg-4',
          role: 'assistant',
          content: '可以使用 props 来配置按钮的样式、大小和功能。',
          timestamp: '2026-03-11T15:30:02.000Z'
        }
      ],
      createdAt: '2026-03-11T15:30:00.000Z',
      updatedAt: '2026-03-11T15:30:02.000Z'
    },
    {
      id: 'conv-3',
      title: '新对话',
      workspaceId: undefined,
      messages: [],
      createdAt: '2026-03-12T08:00:00.000Z',
      updatedAt: '2026-03-12T08:00:00.000Z'
    }
  ];

  constructor() {
    this.registerHandlers();
  }

  private registerHandlers(): void {
    this.registerConversationHandlers();
  }

  /*
  private registerWorkspaceHandlers(): void {
    // ... removed to avoid conflict with real workspace handlers
  }
  */

  private registerConversationHandlers(): void {
    ipcMain.handle('conversation:create', async (_event: IpcMainInvokeEvent, title: string, workspaceId?: string) => {
      const newConversation: Conversation = {
        id: `conv-${Date.now()}`,
        title,
        workspaceId,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.mockConversations.push(newConversation);
      return newConversation;
    });

    ipcMain.handle('conversation:list', async (_event: IpcMainInvokeEvent, workspaceId?: string) => {
      const conversationInfos: ConversationInfo[] = this.mockConversations.map(conv => {
        const lastMessage = conv.messages.length > 0 ? conv.messages[conv.messages.length - 1] : null;
        return {
          id: conv.id,
          title: conv.title,
          lastMessage: lastMessage ? lastMessage.content.slice(0, 50) : '',
          lastMessageTime: lastMessage ? lastMessage.timestamp : conv.updatedAt,
          messageCount: conv.messages.length,
          workspaceId: conv.workspaceId,
          createdAt: conv.createdAt
        };
      });

      if (workspaceId) {
        return conversationInfos.filter(c => c.workspaceId === workspaceId);
      }

      return conversationInfos;
    });

    ipcMain.handle('conversation:get', async (_event: IpcMainInvokeEvent, conversationId: string) => {
      const conversation = this.mockConversations.find(c => c.id === conversationId);
      return conversation || null;
    });

    ipcMain.handle('conversation:updateTitle', async (_event: IpcMainInvokeEvent, conversationId: string, title: string) => {
      const conversation = this.mockConversations.find(c => c.id === conversationId);
      if (conversation) {
        conversation.title = title;
        conversation.updatedAt = new Date().toISOString();
      }
      return true;
    });

    ipcMain.handle('conversation:delete', async (_event: IpcMainInvokeEvent, conversationId: string) => {
      const index = this.mockConversations.findIndex(c => c.id === conversationId);
      if (index !== -1) {
        this.mockConversations.splice(index, 1);
      }
      return true;
    });

    ipcMain.handle('conversation:clear', async (_event: IpcMainInvokeEvent, conversationId: string) => {
      const conversation = this.mockConversations.find(c => c.id === conversationId);
      if (conversation) {
        conversation.messages = [];
        conversation.updatedAt = new Date().toISOString();
      }
      return true;
    });
  }
}

export { MainAPI };
