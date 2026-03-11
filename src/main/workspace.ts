import fs from 'fs';
import path from 'path';
import { app } from 'electron';

interface FolderLink {
  id: string;
  path: string;
  name: string;
  isActive: boolean;
  lastAccessed: string;
}

interface Workspace {
  id: string;
  name: string;
  description: string;
  folders: FolderLink[];
  createdAt: string;
  updatedAt: string;
}

class WorkspaceService {
  private storagePath: string;
  private workspaces: Workspace[];

  constructor() {
    this.storagePath = path.join(app.getPath('appData'), 'workclaw', 'workspaces.json');
    this.workspaces = [];
    this.loadWorkspaces();
  }

  private ensureStoragePath(): void {
    const dir = path.dirname(this.storagePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private loadWorkspaces(): void {
    try {
      this.ensureStoragePath();
      if (fs.existsSync(this.storagePath)) {
        const data = fs.readFileSync(this.storagePath, 'utf8');
        this.workspaces = JSON.parse(data);
      }
    } catch (error) {
      console.error('Failed to load workspaces:', error);
      this.workspaces = [];
    }
  }

  private saveWorkspaces(): void {
    try {
      this.ensureStoragePath();
      fs.writeFileSync(this.storagePath, JSON.stringify(this.workspaces, null, 2));
    } catch (error) {
      console.error('Failed to save workspaces:', error);
    }
  }

  createWorkspace(name: string, description: string = ''): Workspace {
    const existingWorkspace = this.workspaces.find(w => w.name === name);
    if (existingWorkspace) {
      throw new Error('Workspace with this name already exists');
    }

    const workspace: Workspace = {
      id: Date.now().toString(),
      name,
      description,
      folders: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.workspaces.push(workspace);
    this.saveWorkspaces();
    return workspace;
  }

  getWorkspaces(): Workspace[] {
    return this.workspaces;
  }

  getWorkspace(id: string): Workspace | undefined {
    return this.workspaces.find(w => w.id === id);
  }

  updateWorkspace(id: string, updates: Partial<Workspace>): Workspace | undefined {
    const index = this.workspaces.findIndex(w => w.id === id);
    if (index === -1) {
      return undefined;
    }

    this.workspaces[index] = {
      ...this.workspaces[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.saveWorkspaces();
    return this.workspaces[index];
  }

  deleteWorkspace(id: string): boolean {
    const index = this.workspaces.findIndex(w => w.id === id);
    if (index === -1) {
      return false;
    }

    this.workspaces.splice(index, 1);
    this.saveWorkspaces();
    return true;
  }

  addFolderToWorkspace(workspaceId: string, folderPath: string): Workspace | undefined {
    const workspace = this.getWorkspace(workspaceId);
    if (!workspace) {
      return undefined;
    }

    // Check if folder already exists
    const existingFolder = workspace.folders.find(f => f.path === folderPath);
    if (existingFolder) {
      // Update existing folder
      existingFolder.isActive = true;
      existingFolder.lastAccessed = new Date().toISOString();
    } else {
      // Create new folder link
      const folderName = path.basename(folderPath);
      const folderLink: FolderLink = {
        id: Date.now().toString(),
        path: folderPath,
        name: folderName,
        isActive: true,
        lastAccessed: new Date().toISOString()
      };
      workspace.folders.push(folderLink);
    }

    workspace.updatedAt = new Date().toISOString();
    this.saveWorkspaces();
    return workspace;
  }

  removeFolderFromWorkspace(workspaceId: string, folderId: string): Workspace | undefined {
    const workspace = this.getWorkspace(workspaceId);
    if (!workspace) {
      return undefined;
    }

    workspace.folders = workspace.folders.filter(f => f.id !== folderId);
    workspace.updatedAt = new Date().toISOString();
    this.saveWorkspaces();

    return workspace;
  }

  updateFolderLink(workspaceId: string, folderId: string, updates: Partial<FolderLink>): Workspace | undefined {
    const workspace = this.getWorkspace(workspaceId);
    if (!workspace) {
      return undefined;
    }

    const folderIndex = workspace.folders.findIndex(f => f.id === folderId);
    if (folderIndex === -1) {
      return undefined;
    }

    workspace.folders[folderIndex] = {
      ...workspace.folders[folderIndex],
      ...updates,
      lastAccessed: new Date().toISOString()
    };

    workspace.updatedAt = new Date().toISOString();
    this.saveWorkspaces();
    return workspace;
  }
}

export const workspaceService = new WorkspaceService();
export type { Workspace, FolderLink };