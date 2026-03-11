/**
 * Electron 主进程入口文件
 * 负责应用初始化、窗口创建和 IPC 通信处理
 */

import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import type { IpcMainEvent } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { fileSystemService } from './fileSystem';
import { workspaceService } from './workspace';
import { IpcChannel } from '../channels/ipc';
import { FeishuChannel } from '../channels/feishu';
import { agentRuntime } from '../agent/runtime/agent';

// 获取当前文件路径和目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 初始化通道
const ipcChannel = new IpcChannel();
const feishuChannel = new FeishuChannel();

// 绑定消息处理逻辑
const handleMessage = async (channel: IpcChannel | FeishuChannel) => {
  channel.onMessage(async (userId, message) => {
    try {
      // 1. 调用 Agent Runtime 处理消息
      const response = await agentRuntime.processMessage(channel.name, userId, message);
      
      // 2. 将响应发回给用户
      await channel.send(userId, response.content);
    } catch (error: any) {
      console.error(`Error processing message from ${channel.name}:`, error);
      await channel.send(userId, `Error: ${error.message}`);
    }
  });
};

// 绑定所有通道
handleMessage(ipcChannel);
handleMessage(feishuChannel);

/**
 * 创建应用窗口
 * 配置窗口大小、webPreferences 等参数
 */
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      // 预加载脚本
      preload: path.join(__dirname, 'preload.js'),
      // 启用 Node.js 集成
      nodeIntegration: true,
      // 禁用上下文隔离
      contextIsolation: false
    }
  });

  // 根据环境加载不同的页面
  if (process.env.NODE_ENV === 'development') {
    // 开发环境加载本地开发服务器
    mainWindow.loadURL('http://localhost:5173');
    // 打开开发者工具
    mainWindow.webContents.openDevTools();
  } else {
    // 生产环境加载打包后的文件
    // 使用绝对路径确保正确加载
    const distPath = path.join(process.cwd(), 'dist', 'index.html');
    mainWindow.loadFile(distPath);
  }
}

// 应用准备就绪后创建窗口
app.whenReady().then(() => {
  createWindow();

  // 启动通道
  ipcChannel.start();
  feishuChannel.start();

  // 当应用被激活时（如点击 dock 图标），如果没有窗口则创建一个
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// 当所有窗口关闭时退出应用（除了 macOS）
app.on('window-all-closed', function () {
  // 停止通道
  ipcChannel.stop();
  feishuChannel.stop();

  if (process.platform !== 'darwin') app.quit();
});

// IPC 处理程序

/**
 * 处理文件打开请求
 * @param event IPC 事件对象
 * @param filePath 文件路径
 */
ipcMain.on('file:open', async (event: IpcMainEvent, filePath: string) => {
  try {
    // 调用文件系统服务打开文件
    const content = await fileSystemService.openFile(filePath);
    // 回复成功消息，返回文件内容
    event.reply('file:open:success', content);
  } catch (error) {
    // 回复错误消息
    event.reply('file:open:error', error instanceof Error ? error.message : 'Unknown error');
  }
});

/**
 * 处理文件保存请求
 * @param event IPC 事件对象
 * @param filePath 文件路径
 * @param content 文件内容
 */
ipcMain.on('file:save', async (event: IpcMainEvent, filePath: string, content: string) => {
  try {
    // 调用文件系统服务保存文件
    await fileSystemService.saveFile(filePath, content);
    // 回复成功消息
    event.reply('file:save:success');
  } catch (error) {
    // 回复错误消息
    event.reply('file:save:error', error instanceof Error ? error.message : 'Unknown error');
  }
});

/**
 * 处理目录列表请求
 * @param event IPC 事件对象
 * @param directoryPath 目录路径
 */
ipcMain.on('directory:list', async (event: IpcMainEvent, directoryPath: string) => {
  try {
    // 调用文件系统服务列出目录内容
    const entries = await fileSystemService.listDirectory(directoryPath);
    // 回复成功消息，返回目录条目
    event.reply('directory:list:success', entries);
  } catch (error) {
    // 回复错误消息
    event.reply('directory:list:error', error instanceof Error ? error.message : 'Unknown error');
  }
});

/**
 * 处理创建工作区请求
 * @param event IPC 事件对象
 * @param name 工作区名称
 * @param description 工作区描述
 * @returns 新创建的工作区对象
 */
ipcMain.handle('workspace:create', (event: IpcMainEvent, name: string, description: string) => {
  try {
    // 调用工作区服务创建工作区
    const workspace = workspaceService.createWorkspace(name, description);
    return workspace;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Unknown error');
  }
});

/**
 * 处理获取工作区列表请求
 * @returns 工作区列表
 */
ipcMain.handle('workspace:list', () => {
  try {
    // 调用工作区服务获取所有工作区
    const workspaces = workspaceService.getWorkspaces();
    return workspaces;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Unknown error');
  }
});

/**
 * 处理更新工作区请求
 * @param event IPC 事件对象
 * @param id 工作区 ID
 * @param updates 更新内容
 * @returns 更新后的工作区对象
 */
ipcMain.handle('workspace:update', (event: IpcMainEvent, id: string, updates: any) => {
  try {
    // 调用工作区服务更新工作区
    const workspace = workspaceService.updateWorkspace(id, updates);
    return workspace;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Unknown error');
  }
});

/**
 * 处理删除工作区请求
 * @param event IPC 事件对象
 * @param id 工作区 ID
 * @returns 是否删除成功
 */
ipcMain.handle('workspace:delete', (event: IpcMainEvent, id: string) => {
  try {
    // 调用工作区服务删除工作区
    const success = workspaceService.deleteWorkspace(id);
    return success;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Unknown error');
  }
});

/**
 * 处理向工作区添加文件夹请求
 * @param event IPC 事件对象
 * @param workspaceId 工作区 ID
 * @param folderPath 文件夹路径
 * @returns 更新后的工作区对象
 */
ipcMain.handle('workspace:addFolder', (event: IpcMainEvent, workspaceId: string, folderPath: string) => {
  try {
    // 调用工作区服务添加文件夹
    const workspace = workspaceService.addFolderToWorkspace(workspaceId, folderPath);
    return workspace;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Unknown error');
  }
});

/**
 * 处理从工作区移除文件夹请求
 * @param event IPC 事件对象
 * @param workspaceId 工作区 ID
 * @param folderId 文件夹 ID
 * @returns 更新后的工作区对象
 */
ipcMain.handle('workspace:removeFolder', (event: IpcMainEvent, workspaceId: string, folderId: string) => {
  try {
    // 调用工作区服务移除文件夹
    const workspace = workspaceService.removeFolderFromWorkspace(workspaceId, folderId);
    return workspace;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Unknown error');
  }
});

/**
 * 处理更新文件夹链接请求
 * @param event IPC 事件对象
 * @param workspaceId 工作区 ID
 * @param folderId 文件夹 ID
 * @param updates 更新内容
 * @returns 更新后的工作区对象
 */
ipcMain.handle('workspace:updateFolder', (event: IpcMainEvent, workspaceId: string, folderId: string, updates: any) => {
  try {
    // 调用工作区服务更新文件夹链接
    const workspace = workspaceService.updateFolderLink(workspaceId, folderId, updates);
    return workspace;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Unknown error');
  }
});

/**
 * 处理选择文件夹请求
 * @returns 选择的文件夹路径，取消选择返回 null
 */
ipcMain.handle('folder:select', async () => {
  try {
    // 显示文件夹选择对话框
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      title: 'Select Folder'
    });
    
    // 如果用户选择了文件夹，返回第一个路径
    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0];
    } else {
      // 用户取消选择，返回 null
      return null;
    }
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Unknown error');
  }
});
