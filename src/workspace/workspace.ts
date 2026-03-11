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

class WorkspaceManager {
  private workspaces: Map<string, Workspace> = new Map();
  private currentWorkspaceId: string | null = null;

  createWorkspace(name: string, description: string): Workspace {
    const id = `workspace-${Date.now()}`;
    const workspace: Workspace = {
      id,
      name,
      description,
      resources: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.workspaces.set(id, workspace);
    return workspace;
  }

  getWorkspace(id: string): Workspace | null {
    return this.workspaces.get(id) || null;
  }

  getAllWorkspaces(): Workspace[] {
    return Array.from(this.workspaces.values());
  }

  updateWorkspace(id: string, updates: Partial<Workspace>): Workspace | null {
    const workspace = this.getWorkspace(id);
    if (!workspace) {
      return null;
    }

    const updatedWorkspace: Workspace = {
      ...workspace,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.workspaces.set(id, updatedWorkspace);
    return updatedWorkspace;
  }

  deleteWorkspace(id: string): boolean {
    if (this.currentWorkspaceId === id) {
      this.currentWorkspaceId = null;
    }
    return this.workspaces.delete(id);
  }

  addResource(workspaceId: string, resource: Resource): boolean {
    const workspace = this.getWorkspace(workspaceId);
    if (!workspace) {
      return false;
    }

    workspace.resources.push(resource);
    workspace.updatedAt = new Date().toISOString();
    this.workspaces.set(workspaceId, workspace);
    return true;
  }

  removeResource(workspaceId: string, resourcePath: string): boolean {
    const workspace = this.getWorkspace(workspaceId);
    if (!workspace) {
      return false;
    }

    const initialLength = workspace.resources.length;
    workspace.resources = workspace.resources.filter(
      resource => resource.path !== resourcePath
    );
    
    if (workspace.resources.length !== initialLength) {
      workspace.updatedAt = new Date().toISOString();
      this.workspaces.set(workspaceId, workspace);
      return true;
    }

    return false;
  }

  setCurrentWorkspace(id: string): boolean {
    if (!this.workspaces.has(id)) {
      return false;
    }
    this.currentWorkspaceId = id;
    return true;
  }

  getCurrentWorkspace(): Workspace | null {
    if (!this.currentWorkspaceId) {
      return null;
    }
    return this.getWorkspace(this.currentWorkspaceId);
  }

  getCurrentWorkspaceId(): string | null {
    return this.currentWorkspaceId;
  }

  hasAccess(path: string, permission: 'read' | 'write' | 'execute'): boolean {
    const currentWorkspace = this.getCurrentWorkspace();
    if (!currentWorkspace) {
      return false;
    }

    for (const resource of currentWorkspace.resources) {
      if (path.startsWith(resource.path)) {
        if (resource.permissions === 'all') {
          return true;
        }
        if (resource.permissions === permission) {
          return true;
        }
      }
    }

    return false;
  }

  exportWorkspaces(): string {
    return JSON.stringify(Array.from(this.workspaces.values()), null, 2);
  }

  importWorkspaces(workspaces: Workspace[]): void {
    for (const workspace of workspaces) {
      this.workspaces.set(workspace.id, workspace);
    }
  }
}

export { WorkspaceManager, Workspace, Resource };
