import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../main/db';

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
  private currentWorkspaceId: string | null = null;

  constructor() {
    this.loadCurrentWorkspaceId();
  }

  private loadCurrentWorkspaceId() {
    // 尝试从数据库加载最后激活的工作空间
    const db = getDatabase();
    try {
      const stmt = db.prepare('SELECT id FROM workspaces WHERE is_active = 1 LIMIT 1');
      const row = stmt.get() as { id: string } | undefined;
      if (row) {
        this.currentWorkspaceId = row.id;
      }
    } catch (error) {
      console.error('Failed to load current workspace id:', error);
    }
  }

  createWorkspace(name: string, description: string): Workspace {
    const id = uuidv4();
    const now = new Date().toISOString();
    const workspace: Workspace = {
      id,
      name,
      description,
      resources: [],
      createdAt: now,
      updatedAt: now
    };

    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO workspaces (id, name, description, created_at, updated_at)
      VALUES (@id, @name, @description, @createdAt, @updatedAt)
    `);
    
    stmt.run(workspace);
    return workspace;
  }

  getWorkspace(id: string): Workspace | null {
    const db = getDatabase();
    const workspaceStmt = db.prepare('SELECT * FROM workspaces WHERE id = ?');
    const resourceStmt = db.prepare('SELECT * FROM resources WHERE workspace_id = ?');

    const row = workspaceStmt.get(id) as any;
    if (!row) return null;

    const resources = resourceStmt.all(id) as any[];

    return {
      id: row.id,
      name: row.name,
      description: row.description,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      resources: resources.map(r => ({
        path: r.path,
        type: r.type,
        permissions: r.permissions
      }))
    };
  }

  getAllWorkspaces(): Workspace[] {
    const db = getDatabase();
    const workspaceStmt = db.prepare('SELECT * FROM workspaces');
    // 注意：这里为了性能，getAllWorkspaces 可能不需要加载所有资源，或者只加载摘要
    // 但为了保持接口一致，我们先简单实现为循环加载资源，或者用 JOIN
    // 考虑到资源列表通常不大，我们可以分两步查询
    
    const rows = workspaceStmt.all() as any[];
    
    // 优化：一次性查询所有资源，然后在内存中分组
    const resourceStmt = db.prepare('SELECT * FROM resources');
    const allResources = resourceStmt.all() as any[];
    
    const resourcesByWorkspace = new Map<string, Resource[]>();
    for (const r of allResources) {
      if (!resourcesByWorkspace.has(r.workspace_id)) {
        resourcesByWorkspace.set(r.workspace_id, []);
      }
      resourcesByWorkspace.get(r.workspace_id)?.push({
        path: r.path,
        type: r.type,
        permissions: r.permissions
      });
    }

    return rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      resources: resourcesByWorkspace.get(row.id) || []
    }));
  }

  updateWorkspace(id: string, updates: Partial<Workspace>): Workspace | null {
    const db = getDatabase();
    const current = this.getWorkspace(id);
    if (!current) return null;

    const updated = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // 构建动态更新语句
    const fields: string[] = [];
    const params: any = { id };
    
    if (updates.name !== undefined) {
      fields.push('name = @name');
      params.name = updates.name;
    }
    if (updates.description !== undefined) {
      fields.push('description = @description');
      params.description = updates.description;
    }
    
    fields.push('updated_at = @updatedAt');
    params.updatedAt = updated.updatedAt;

    if (fields.length > 1) { // 至少有 updated_at
        const stmt = db.prepare(`UPDATE workspaces SET ${fields.join(', ')} WHERE id = @id`);
        stmt.run(params);
    }

    // 注意：这里没有处理 resources 的更新，因为 addResource/removeResource 单独处理
    // 如果 updates 包含 resources，且需要全量替换，逻辑会比较复杂，暂不处理
    
    return this.getWorkspace(id); // 重新获取以确保一致性
  }

  deleteWorkspace(id: string): boolean {
    const db = getDatabase();
    
    if (this.currentWorkspaceId === id) {
      this.currentWorkspaceId = null;
      // 更新数据库中的激活状态
       db.prepare('UPDATE workspaces SET is_active = 0 WHERE id = ?').run(id);
    }

    const info = db.prepare('DELETE FROM workspaces WHERE id = ?').run(id);
    // 资源会因为外键级联删除而自动删除
    return info.changes > 0;
  }

  addResource(workspaceId: string, resource: Resource): boolean {
    const db = getDatabase();
    
    // 检查 workspace 是否存在
    const workspace = db.prepare('SELECT id FROM workspaces WHERE id = ?').get(workspaceId);
    if (!workspace) return false;

    const resourceId = uuidv4();
    try {
        const stmt = db.prepare(`
            INSERT INTO resources (id, workspace_id, path, type, permissions)
            VALUES (?, ?, ?, ?, ?)
        `);
        stmt.run(resourceId, workspaceId, resource.path, resource.type, resource.permissions);
        
        // 更新工作空间修改时间
        db.prepare('UPDATE workspaces SET updated_at = ? WHERE id = ?')
          .run(new Date().toISOString(), workspaceId);
          
        return true;
    } catch (error) {
        console.error('Failed to add resource:', error);
        return false;
    }
  }

  removeResource(workspaceId: string, resourcePath: string): boolean {
    const db = getDatabase();
    
    // 检查 workspace 是否存在
    const workspace = db.prepare('SELECT id FROM workspaces WHERE id = ?').get(workspaceId);
    if (!workspace) return false;

    const info = db.prepare('DELETE FROM resources WHERE workspace_id = ? AND path = ?')
                   .run(workspaceId, resourcePath);

    if (info.changes > 0) {
       // 更新工作空间修改时间
       db.prepare('UPDATE workspaces SET updated_at = ? WHERE id = ?')
         .run(new Date().toISOString(), workspaceId);
       return true;
    }
    return false;
  }

  setCurrentWorkspace(id: string): boolean {
    const db = getDatabase();
    
    // 检查 workspace 是否存在
    const workspace = db.prepare('SELECT id FROM workspaces WHERE id = ?').get(id);
    if (!workspace) return false;

    // 事务处理：先清除所有 active 标记，再设置新的
    const updateActive = db.transaction(() => {
        db.prepare('UPDATE workspaces SET is_active = 0').run();
        db.prepare('UPDATE workspaces SET is_active = 1 WHERE id = ?').run(id);
    });

    try {
        updateActive();
        this.currentWorkspaceId = id;
        return true;
    } catch (error) {
        console.error('Failed to set current workspace:', error);
        return false;
    }
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
      return JSON.stringify(this.getAllWorkspaces(), null, 2);
  }

  importWorkspaces(workspaces: Workspace[]): void {
      // 简单实现：循环创建
      for (const ws of workspaces) {
          // 这里需要处理 ID 冲突，或者重新生成 ID
          // 为简单起见，假设导入时创建新工作空间
          const newWs = this.createWorkspace(ws.name, ws.description);
          for (const res of ws.resources) {
              this.addResource(newWs.id, res);
          }
      }
  }
}

export { WorkspaceManager };
export type { Workspace, Resource };
