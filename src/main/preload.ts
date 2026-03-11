import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron';

/**
 * 暴露给渲染进程的 Electron API
 * 遵循安全最佳实践，只暴露必要的 IPC 方法
 */
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
    send: (channel: string, ...args: any[]) => ipcRenderer.send(channel, ...args),
    on: (channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void) => {
      ipcRenderer.on(channel, listener);
      return () => ipcRenderer.removeListener(channel, listener);
    },
    once: (channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void) => 
      ipcRenderer.once(channel, listener),
    removeListener: (channel: string, listener: (...args: any[]) => void) => 
      ipcRenderer.removeListener(channel, listener),
    removeAllListeners: (channel: string) => ipcRenderer.removeAllListeners(channel)
  }
});

// 兼容旧 API (可选，建议逐步迁移)
contextBridge.exposeInMainWorld('electronAPI', {
  openFile: (filePath: string) => ipcRenderer.send('file:open', filePath),
  saveFile: (filePath: string, content: string) => ipcRenderer.send('file:save', filePath, content),
  onFileOpened: (callback: (event: IpcRendererEvent, content: string) => void) => 
    ipcRenderer.on('file:opened', callback)
});
