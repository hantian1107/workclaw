import { contextBridge, ipcRenderer } from 'electron';

const electronAPI = {
  sendMessage: (message: any) => {
    ipcRenderer.send('message', message);
  },
  onMessage: (callback: (message: any) => void) => {
    ipcRenderer.on('message', (_event, message) => {
      callback(message);
    });
  },
  workspace: {
    create: (name: string, description: string) => {
      return ipcRenderer.invoke('workspace:create', name, description);
    },
    list: () => {
      return ipcRenderer.invoke('workspace:list');
    },
    get: (id: string) => {
      return ipcRenderer.invoke('workspace:get', id);
    },
    update: (id: string, updates: any) => {
      return ipcRenderer.invoke('workspace:update', id, updates);
    },
    delete: (id: string) => {
      return ipcRenderer.invoke('workspace:delete', id);
    },
    switch: (id: string) => {
      return ipcRenderer.invoke('workspace:switch', id);
    },
    addResource: (workspaceId: string, resource: any) => {
      return ipcRenderer.invoke('workspace:resource:add', workspaceId, resource);
    },
    removeResource: (workspaceId: string, resourcePath: string) => {
      return ipcRenderer.invoke('workspace:resource:remove', workspaceId, resourcePath);
    }
  },
  conversation: {
    create: (title: string, workspaceId?: string) => {
      return ipcRenderer.invoke('conversation:create', title, workspaceId);
    },
    list: (workspaceId?: string) => {
      return ipcRenderer.invoke('conversation:list', workspaceId);
    },
    get: (conversationId: string) => {
      return ipcRenderer.invoke('conversation:get', conversationId);
    },
    updateTitle: (conversationId: string, title: string) => {
      return ipcRenderer.invoke('conversation:updateTitle', conversationId, title);
    },
    delete: (conversationId: string) => {
      return ipcRenderer.invoke('conversation:delete', conversationId);
    },
    clear: (conversationId: string) => {
      return ipcRenderer.invoke('conversation:clear', conversationId);
    }
  }
};

contextBridge.exposeInMainWorld('electron', electronAPI);

declare global {
  interface Window {
    electron: typeof electronAPI;
  }
}
