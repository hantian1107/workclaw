import { contextBridge, ipcRenderer } from 'electron';

// 定义暴露给渲染进程的API
const electronAPI = {
  // 发送消息到主进程
  sendMessage: (message: any) => {
    ipcRenderer.send('message', message);
  },
  // 接收来自主进程的消息
  onMessage: (callback: (message: any) => void) => {
    ipcRenderer.on('message', (event, message) => {
      callback(message);
    });
  },
  // 工作空间操作
  workspace: {
    create: (name: string, description: string) => {
      return ipcRenderer.invoke('workspace:create', { name, description });
    },
    list: () => {
      return ipcRenderer.invoke('workspace:list');
    },
    switch: (id: string) => {
      return ipcRenderer.invoke('workspace:switch', id);
    },
    addResource: (workspaceId: string, resource: any) => {
      return ipcRenderer.invoke('workspace:addResource', { workspaceId, resource });
    }
  }
};

// 暴露API到渲染进程
contextBridge.exposeInMainWorld('electron', electronAPI);

// 类型定义，用于TypeScript
declare global {
  interface Window {
    electron: typeof electronAPI;
  }
}
