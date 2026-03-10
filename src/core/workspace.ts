import { v4 as uuidv4 } from 'uuid';

export interface WorkspaceConfig {
  id: string;
  name: string;
  resources: WorkspaceResource[];
}

export interface WorkspaceResource {
  type: 'file' | 'folder' | 'app';
  path: string;
}

export class WorkspaceManager {
  private workspaces: Map<string, WorkspaceConfig> = new Map();
  private activeWorkspaceId: string | null = null;

  constructor() {
    // Initialize with a default workspace if none exists
    this.createDefaultWorkspace();
  }

  private createDefaultWorkspace() {
    const defaultId = 'default';
    this.workspaces.set(defaultId, {
      id: defaultId,
      name: 'Default Workspace',
      resources: []
    });
    this.activeWorkspaceId = defaultId;
  }

  public createWorkspace(name: string): WorkspaceConfig {
    const id = uuidv4();
    const workspace: WorkspaceConfig = {
      id,
      name,
      resources: []
    };
    this.workspaces.set(id, workspace);
    return workspace;
  }

  public getWorkspace(id: string): WorkspaceConfig | undefined {
    return this.workspaces.get(id);
  }

  public getAllWorkspaces(): WorkspaceConfig[] {
    return Array.from(this.workspaces.values());
  }

  public setActiveWorkspace(id: string): void {
    if (!this.workspaces.has(id)) {
      throw new Error(`Workspace with ID ${id} not found`);
    }
    this.activeWorkspaceId = id;
  }

  public getActiveWorkspace(): WorkspaceConfig | null {
    if (!this.activeWorkspaceId) return null;
    return this.workspaces.get(this.activeWorkspaceId) || null;
  }

  public addResourceToWorkspace(workspaceId: string, resource: WorkspaceResource): void {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) {
      throw new Error(`Workspace with ID ${workspaceId} not found`);
    }
    // Check for duplicates
    const exists = workspace.resources.some(r => r.path === resource.path && r.type === resource.type);
    if (!exists) {
      workspace.resources.push(resource);
    }
  }

  public removeResourceFromWorkspace(workspaceId: string, resourcePath: string): void {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) {
      throw new Error(`Workspace with ID ${workspaceId} not found`);
    }
    workspace.resources = workspace.resources.filter(r => r.path !== resourcePath);
  }
}

export const workspaceManager = new WorkspaceManager();
