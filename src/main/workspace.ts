/**
 * 工作区服务
 * 负责工作区的创建、管理和持久化存储
 */
import fs from 'fs';
import path from 'path';
import { app } from 'electron';

/**
 * 文件夹链接接口
 * 表示工作区中的一个文件夹
 */
interface FolderLink {
  /** 文件夹唯一标识符 */
  id: string;
  /** 文件夹路径 */
  path: string;
  /** 文件夹名称 */
  name: string;
  /** 是否激活 */
  isActive: boolean;
  /** 最后访问时间 */
  lastAccessed: string;
}

/**
 * 工作区接口
 * 表示一个工作区对象
 */
interface Workspace {
  /** 工作区唯一标识符 */
  id: string;
  /** 工作区名称 */
  name: string;
  /** 工作区描述 */
  description: string;
  /** 工作区中的文件夹列表 */
  folders: FolderLink[];
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

/**
 * 工作区服务类
 * 提供工作区的创建、管理和持久化存储功能
 */
class WorkspaceService {
  /** 工作区存储路径 */
  private storagePath: string;
  /** 工作区列表 */
  private workspaces: Workspace[];

  /**
   * 构造函数
   * 初始化存储路径并加载工作区
   */
  constructor() {
    // 设置工作区存储路径
    this.storagePath = path.join(app.getPath('appData'), 'workclaw', 'workspaces.json');
    // 初始化工作区列表
    this.workspaces = [];
    // 加载工作区
    this.loadWorkspaces();
  }

  /**
   * 确保存储路径存在
   * 如果不存在则创建目录
   */
  private ensureStoragePath(): void {
    const dir = path.dirname(this.storagePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * 加载工作区
   * 从存储文件中读取工作区数据
   */
  private loadWorkspaces(): void {
    try {
      // 确保存储路径存在
      this.ensureStoragePath();
      // 如果存储文件存在，则读取数据
      if (fs.existsSync(this.storagePath)) {
        const data = fs.readFileSync(this.storagePath, 'utf8');
        this.workspaces = JSON.parse(data);
      }
    } catch (error) {
      console.error('Failed to load workspaces:', error);
      // 加载失败时使用空数组
      this.workspaces = [];
    }
  }

  /**
   * 保存工作区
   * 将工作区数据写入存储文件
   */
  private saveWorkspaces(): void {
    try {
      // 确保存储路径存在
      this.ensureStoragePath();
      // 写入工作区数据
      fs.writeFileSync(this.storagePath, JSON.stringify(this.workspaces, null, 2));
    } catch (error) {
      console.error('Failed to save workspaces:', error);
    }
  }

  /**
   * 创建工作区
   * @param name 工作区名称
   * @param description 工作区描述
   * @returns 创建的工作区对象
   * @throws 如果工作区名称已存在则抛出错误
   */
  createWorkspace(name: string, description: string = ''): Workspace {
    // 检查工作区名称是否已存在
    const existingWorkspace = this.workspaces.find(w => w.name === name);
    if (existingWorkspace) {
      throw new Error('Workspace with this name already exists');
    }

    // 创建新工作区
    const workspace: Workspace = {
      id: Date.now().toString(),
      name,
      description,
      folders: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 添加到工作区列表
    this.workspaces.push(workspace);
    // 保存工作区
    this.saveWorkspaces();
    return workspace;
  }

  /**
   * 获取所有工作区
   * @returns 工作区列表
   */
  getWorkspaces(): Workspace[] {
    return this.workspaces;
  }

  /**
   * 根据ID获取工作区
   * @param id 工作区ID
   * @returns 工作区对象或undefined
   */
  getWorkspace(id: string): Workspace | undefined {
    return this.workspaces.find(w => w.id === id);
  }

  /**
   * 更新工作区
   * @param id 工作区ID
   * @param updates 更新内容
   * @returns 更新后的工作区对象或undefined
   */
  updateWorkspace(id: string, updates: Partial<Workspace>): Workspace | undefined {
    // 查找工作区索引
    const index = this.workspaces.findIndex(w => w.id === id);
    if (index === -1) {
      return undefined;
    }

    // 更新工作区
    this.workspaces[index] = {
      ...this.workspaces[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // 保存工作区
    this.saveWorkspaces();
    return this.workspaces[index];
  }

  /**
   * 删除工作区
   * @param id 工作区ID
   * @returns 是否删除成功
   */
  deleteWorkspace(id: string): boolean {
    // 查找工作区索引
    const index = this.workspaces.findIndex(w => w.id === id);
    if (index === -1) {
      return false;
    }

    // 从列表中移除工作区
    this.workspaces.splice(index, 1);
    // 保存工作区
    this.saveWorkspaces();
    return true;
  }

  /**
   * 向工作区添加文件夹
   * @param workspaceId 工作区ID
   * @param folderPath 文件夹路径
   * @returns 更新后的工作区对象或undefined
   */
  addFolderToWorkspace(workspaceId: string, folderPath: string): Workspace | undefined {
    // 获取工作区
    const workspace = this.getWorkspace(workspaceId);
    if (!workspace) {
      return undefined;
    }

    // 检查文件夹是否已存在
    const existingFolder = workspace.folders.find(f => f.path === folderPath);
    if (existingFolder) {
      // 更新现有文件夹
      existingFolder.isActive = true;
      existingFolder.lastAccessed = new Date().toISOString();
    } else {
      // 创建新文件夹链接
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

    // 更新工作区时间戳
    workspace.updatedAt = new Date().toISOString();
    // 保存工作区
    this.saveWorkspaces();
    return workspace;
  }

  /**
   * 从工作区移除文件夹
   * @param workspaceId 工作区ID
   * @param folderId 文件夹ID
   * @returns 更新后的工作区对象或undefined
   */
  removeFolderFromWorkspace(workspaceId: string, folderId: string): Workspace | undefined {
    // 获取工作区
    const workspace = this.getWorkspace(workspaceId);
    if (!workspace) {
      return undefined;
    }

    // 过滤掉要删除的文件夹
    workspace.folders = workspace.folders.filter(f => f.id !== folderId);
    // 更新工作区时间戳
    workspace.updatedAt = new Date().toISOString();
    // 保存工作区
    this.saveWorkspaces();

    return workspace;
  }

  /**
   * 更新文件夹链接
   * @param workspaceId 工作区ID
   * @param folderId 文件夹ID
   * @param updates 更新内容
   * @returns 更新后的工作区对象或undefined
   */
  updateFolderLink(workspaceId: string, folderId: string, updates: Partial<FolderLink>): Workspace | undefined {
    // 获取工作区
    const workspace = this.getWorkspace(workspaceId);
    if (!workspace) {
      return undefined;
    }

    // 查找文件夹索引
    const folderIndex = workspace.folders.findIndex(f => f.id === folderId);
    if (folderIndex === -1) {
      return undefined;
    }

    // 更新文件夹
    workspace.folders[folderIndex] = {
      ...workspace.folders[folderIndex],
      ...updates,
      lastAccessed: new Date().toISOString()
    };

    // 更新工作区时间戳
    workspace.updatedAt = new Date().toISOString();
    // 保存工作区
    this.saveWorkspaces();
    return workspace;
  }
}

/**
 * 工作区服务实例
 */
export const workspaceService = new WorkspaceService();

// 导出类型
export type { Workspace, FolderLink };