# 代码变更预览

本文档预览了 `implement-workspace-logic` 变更将涉及的关键代码修改。

## 1. 数据库设置

### `src/main/db/index.ts` (新建)

```typescript
import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'path';
import { initWorkspaceDatabase } from './workspace';

let db: Database.Database;

export function initDatabase() {
  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'workclaw.db');
  
  db = new Database(dbPath);
  
  // 调用各模块的初始化函数
  initWorkspaceDatabase(db);

  return db;
}

export function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}
```

### `src/main/db/workspace.ts` (新建)

```typescript
import Database from 'better-sqlite3';

export function initWorkspaceDatabase(db: Database.Database) {
  // 创建工作空间表
  db.exec(`
    CREATE TABLE IF NOT EXISTS workspaces (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      is_active INTEGER DEFAULT 0
    )
  `);

  // 创建资源表
  db.exec(`
    CREATE TABLE IF NOT EXISTS resources (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      path TEXT NOT NULL,
      type TEXT NOT NULL,
      permissions TEXT NOT NULL,
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
    )
  `);
}
```

## 2. 工作空间管理器实现

### `src/workspace/workspace.ts` (修改)

```typescript
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../main/db';

// ... 现有接口定义 ...

class WorkspaceManager {
  // 移除内存 Map
  // private workspaces: Map<string, Workspace> = new Map();
  
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
  
  // ... 其他方法的持久化实现 ...
}
```

## 3. IPC 层集成

### `src/main/ipc/workspace.ts` (新建)

```typescript
import { ipcMain } from 'electron';
import { WorkspaceManager } from '../../workspace/workspace';

export function registerWorkspaceHandlers(workspaceManager: WorkspaceManager) {
  ipcMain.handle('workspace:create', async (_, name, description) => {
    return workspaceManager.createWorkspace(name, description);
  });

  ipcMain.handle('workspace:list', async () => {
    return workspaceManager.getAllWorkspaces();
  });
  
  ipcMain.handle('workspace:switch', async (_, id) => {
    return workspaceManager.setCurrentWorkspace(id);
  });

  // ... 其他 IPC 处理程序 ...
}
```

## 4. 主进程入口

### `src/main/index.ts` (修改示意)

```typescript
import { initDatabase } from './db';
import { WorkspaceManager } from '../workspace/workspace';
import { registerWorkspaceHandlers } from './ipc/workspace';

// 在应用启动时
app.whenReady().then(() => {
  initDatabase();
  const workspaceManager = new WorkspaceManager();
  registerWorkspaceHandlers(workspaceManager);
  
  createWindow();
});
```

## 5. 预加载脚本

### `src/preload/index.ts` (修改示意)

```typescript
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  workspace: {
    create: (name: string, description: string) => ipcRenderer.invoke('workspace:create', name, description),
    list: () => ipcRenderer.invoke('workspace:list'),
    switch: (id: string) => ipcRenderer.invoke('workspace:switch', id),
    // ... 其他方法
  }
});
```
