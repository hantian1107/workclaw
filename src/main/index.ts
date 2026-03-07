
// @ts-ignore - Electron types will be available after installation
import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import type { IpcMainEvent } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { fileSystemService } from './fileSystem';
import { workspaceService } from './workspace';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // Use absolute path to ensure it works correctly
    const distPath = path.join(process.cwd(), 'dist', 'index.html');
    mainWindow.loadFile(distPath);
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// IPC handlers
ipcMain.on('file:open', async (event: IpcMainEvent, filePath: string) => {
  try {
    const content = await fileSystemService.openFile(filePath);
    event.reply('file:open:success', content);
  } catch (error) {
    event.reply('file:open:error', error instanceof Error ? error.message : 'Unknown error');
  }
});

ipcMain.on('file:save', async (event: IpcMainEvent, filePath: string, content: string) => {
  try {
    await fileSystemService.saveFile(filePath, content);
    event.reply('file:save:success');
  } catch (error) {
    event.reply('file:save:error', error instanceof Error ? error.message : 'Unknown error');
  }
});

ipcMain.on('directory:list', async (event: IpcMainEvent, directoryPath: string) => {
  try {
    const entries = await fileSystemService.listDirectory(directoryPath);
    event.reply('directory:list:success', entries);
  } catch (error) {
    event.reply('directory:list:error', error instanceof Error ? error.message : 'Unknown error');
  }
});

ipcMain.handle('workspace:create', (event: IpcMainEvent, name: string, description: string) => {
  try {
    const workspace = workspaceService.createWorkspace(name, description);
    return workspace;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Unknown error');
  }
});

ipcMain.handle('workspace:list', () => {
  try {
    const workspaces = workspaceService.getWorkspaces();
    return workspaces;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Unknown error');
  }
});

ipcMain.handle('workspace:update', (event: IpcMainEvent, id: string, updates: any) => {
  try {
    const workspace = workspaceService.updateWorkspace(id, updates);
    return workspace;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Unknown error');
  }
});

ipcMain.handle('workspace:delete', (event: IpcMainEvent, id: string) => {
  try {
    const success = workspaceService.deleteWorkspace(id);
    return success;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Unknown error');
  }
});

ipcMain.handle('workspace:addFolder', (event: IpcMainEvent, workspaceId: string, folderPath: string) => {
  try {
    const workspace = workspaceService.addFolderToWorkspace(workspaceId, folderPath);
    return workspace;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Unknown error');
  }
});

ipcMain.handle('workspace:removeFolder', (event: IpcMainEvent, workspaceId: string, folderId: string) => {
  try {
    const workspace = workspaceService.removeFolderFromWorkspace(workspaceId, folderId);
    return workspace;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Unknown error');
  }
});

ipcMain.handle('workspace:updateFolder', (event: IpcMainEvent, workspaceId: string, folderId: string, updates: any) => {
  try {
    const workspace = workspaceService.updateFolderLink(workspaceId, folderId, updates);
    return workspace;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Unknown error');
  }
});

ipcMain.handle('folder:select', async () => {
  try {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      title: 'Select Folder'
    });
    
    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0];
    } else {
      return null;
    }
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Unknown error');
  }
});