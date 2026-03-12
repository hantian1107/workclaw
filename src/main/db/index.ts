import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import { initWorkspaceDatabase } from './workspace';

let db: Database.Database;

export function initDatabase() {
  const userDataPath = app.getPath('userData');
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
  }
  const dbPath = path.join(userDataPath, 'workclaw.db');
  
  // better-sqlite3 需要绝对路径
  // 在某些 Electron 环境中，可能需要特殊的 native binding 处理
  // 这里保持原样，因为 native binding 已经在 vite config 中 external 了
  db = new Database(dbPath);
  
  // 启用外键约束
  db.pragma('foreign_keys = ON');
  
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
