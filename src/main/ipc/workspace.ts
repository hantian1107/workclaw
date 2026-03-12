import { ipcMain } from 'electron';
import { WorkspaceManager, type Resource } from '../../workspace/workspace';

export function registerWorkspaceHandlers(workspaceManager: WorkspaceManager) {
  ipcMain.handle('workspace:create', async (_, name: string, description: string) => {
    try {
      return workspaceManager.createWorkspace(name, description);
    } catch (error) {
      console.error('IPC workspace:create error:', error);
      throw error;
    }
  });

  ipcMain.handle('workspace:list', async () => {
    try {
      return workspaceManager.getAllWorkspaces();
    } catch (error) {
      console.error('IPC workspace:list error:', error);
      throw error;
    }
  });

  ipcMain.handle('workspace:get', async (_, id: string) => {
    try {
      return workspaceManager.getWorkspace(id);
    } catch (error) {
      console.error('IPC workspace:get error:', error);
      throw error;
    }
  });

  ipcMain.handle('workspace:update', async (_, id: string, updates: any) => {
    try {
      return workspaceManager.updateWorkspace(id, updates);
    } catch (error) {
      console.error('IPC workspace:update error:', error);
      throw error;
    }
  });

  ipcMain.handle('workspace:delete', async (_, id: string) => {
    try {
      return workspaceManager.deleteWorkspace(id);
    } catch (error) {
      console.error('IPC workspace:delete error:', error);
      throw error;
    }
  });

  ipcMain.handle('workspace:switch', async (_, id: string) => {
    try {
      return workspaceManager.setCurrentWorkspace(id);
    } catch (error) {
      console.error('IPC workspace:switch error:', error);
      throw error;
    }
  });

  ipcMain.handle('workspace:resource:add', async (_, workspaceId: string, resource: Resource) => {
    try {
      return workspaceManager.addResource(workspaceId, resource);
    } catch (error) {
      console.error('IPC workspace:resource:add error:', error);
      throw error;
    }
  });

  ipcMain.handle('workspace:resource:remove', async (_, workspaceId: string, resourcePath: string) => {
    try {
      return workspaceManager.removeResource(workspaceId, resourcePath);
    } catch (error) {
      console.error('IPC workspace:resource:remove error:', error);
      throw error;
    }
  });
}
