/**
 * 工作区状态管理模块
 * 使用 Zustand 管理工作区相关的状态和操作
 */
import { create } from 'zustand';

// 扩展 Window 接口以包含 electron 属性
declare global {
  interface Window {
    electron?: {
      ipcRenderer: {
        /**
         * 调用 Electron 主进程方法
         * @param channel 通道名称
         * @param args 传递的参数
         * @returns Promise<T> 主进程返回的结果
         */
        invoke: <T = any>(channel: string, ...args: any[]) => Promise<T>;
      };
    };
  }
}

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
 * 工作区状态接口
 * 定义了工作区状态管理的结构
 */
interface WorkspaceState {
  /** 所有工作区列表 */
  workspaces: Workspace[];
  /** 当前选中的工作区 */
  currentWorkspace: Workspace | null;
  /** 是否正在加载 */
  isLoading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 操作方法 */
  actions: {
    /**
     * 创建新工作区
     * @param name 工作区名称
     * @param description 工作区描述
     * @returns Promise<Workspace> 创建的工作区对象
     */
    createWorkspace: (name: string, description: string) => Promise<Workspace>;
    /**
     * 获取所有工作区
     * @returns Promise<void>
     */
    getWorkspaces: () => Promise<void>;
    /**
     * 更新工作区
     * @param id 工作区ID
     * @param updates 更新内容
     * @returns Promise<Workspace> 更新后的工作区对象
     */
    updateWorkspace: (id: string, updates: Partial<Workspace>) => Promise<Workspace>;
    /**
     * 删除工作区
     * @param id 工作区ID
     * @returns Promise<boolean> 是否删除成功
     */
    deleteWorkspace: (id: string) => Promise<boolean>;
    /**
     * 向工作区添加文件夹
     * @param workspaceId 工作区ID
     * @param folderPath 文件夹路径
     * @returns Promise<Workspace> 更新后的工作区对象
     */
    addFolderToWorkspace: (workspaceId: string, folderPath: string) => Promise<Workspace>;
    /**
     * 从工作区移除文件夹
     * @param workspaceId 工作区ID
     * @param folderId 文件夹ID
     * @returns Promise<Workspace> 更新后的工作区对象
     */
    removeFolderFromWorkspace: (workspaceId: string, folderId: string) => Promise<Workspace>;
    /**
     * 更新文件夹链接
     * @param workspaceId 工作区ID
     * @param folderId 文件夹ID
     * @param updates 更新内容
     * @returns Promise<Workspace> 更新后的工作区对象
     */
    updateFolderLink: (workspaceId: string, folderId: string, updates: Partial<FolderLink>) => Promise<Workspace>;
    /**
     * 选择文件夹
     * @returns Promise<string | null> 选择的文件夹路径，取消选择返回null
     */
    selectFolder: () => Promise<string | null>;
    /**
     * 设置当前工作区
     * @param workspace 工作区对象或null
     */
    setCurrentWorkspace: (workspace: Workspace | null) => void;
    /**
     * 清除错误信息
     */
    clearError: () => void;
  };
}

// 检查是否在 Electron 环境中
const isElectron = typeof window !== 'undefined' && !!window.electron;

// 浏览器开发环境的模拟数据
const mockWorkspaces: Workspace[] = [
  {
    id: '1',
    name: 'Default Workspace',
    description: 'Default workspace for testing',
    folders: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

/**
 * 工作区状态管理钩子
 * 提供工作区相关的状态和操作方法
 */
export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  // 初始状态
  workspaces: isElectron ? [] : mockWorkspaces,
  currentWorkspace: null,
  isLoading: false,
  error: null,
  
  // 操作方法
  actions: {
    /**
     * 创建新工作区
     * @param name 工作区名称
     * @param description 工作区描述
     * @returns Promise<Workspace> 创建的工作区对象
     */
    createWorkspace: async (name: string, description: string) => {
      // 设置加载状态，清除错误
      set({ isLoading: true, error: null });
      try {
        if (isElectron) {
          // 在 Electron 环境中调用主进程方法
          const workspace = await window.electron!.ipcRenderer.invoke('workspace:create', name, description);
          // 更新状态
          set((state) => ({
            workspaces: [...state.workspaces, workspace],
            isLoading: false
          }));
          return workspace;
        } else {
          // 浏览器环境的模拟实现
          const workspace: Workspace = {
            id: Date.now().toString(),
            name,
            description,
            folders: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          // 更新状态
          set((state) => ({
            workspaces: [...state.workspaces, workspace],
            isLoading: false
          }));
          return workspace;
        }
      } catch (error) {
        // 处理错误
        set({ error: error instanceof Error ? error.message : 'Failed to create workspace', isLoading: false });
        throw error;
      }
    },
    
    /**
     * 获取所有工作区
     * @returns Promise<void>
     */
    getWorkspaces: async () => {
      // 设置加载状态，清除错误
      set({ isLoading: true, error: null });
      try {
        if (isElectron) {
          // 在 Electron 环境中调用主进程方法
          const workspaces = await window.electron!.ipcRenderer.invoke('workspace:list');
          // 更新状态
          set({ workspaces, isLoading: false });
        } else {
          // 浏览器环境使用模拟数据
          set({ workspaces: mockWorkspaces, isLoading: false });
        }
      } catch (error) {
        // 处理错误
        set({ error: error instanceof Error ? error.message : 'Failed to get workspaces', isLoading: false });
      }
    },
    
    /**
     * 更新工作区
     * @param id 工作区ID
     * @param updates 更新内容
     * @returns Promise<Workspace> 更新后的工作区对象
     */
    updateWorkspace: async (id: string, updates: Partial<Workspace>) => {
      // 设置加载状态，清除错误
      set({ isLoading: true, error: null });
      try {
        if (isElectron) {
          // 在 Electron 环境中调用主进程方法
          const updatedWorkspace = await window.electron!.ipcRenderer.invoke('workspace:update', id, updates);
          // 更新状态
          set((state) => ({
            workspaces: state.workspaces.map(workspace => 
              workspace.id === id ? updatedWorkspace : workspace
            ),
            currentWorkspace: state.currentWorkspace?.id === id ? updatedWorkspace : state.currentWorkspace,
            isLoading: false
          }));
          return updatedWorkspace;
        } else {
          // 浏览器环境的模拟实现
          const updatedWorkspace = {
            ...get().workspaces.find(w => w.id === id)!,
            ...updates,
            updatedAt: new Date().toISOString()
          };
          // 更新状态
          set((state) => ({
            workspaces: state.workspaces.map(workspace => 
              workspace.id === id ? updatedWorkspace : workspace
            ),
            currentWorkspace: state.currentWorkspace?.id === id ? updatedWorkspace : state.currentWorkspace,
            isLoading: false
          }));
          return updatedWorkspace;
        }
      } catch (error) {
        // 处理错误
        set({ error: error instanceof Error ? error.message : 'Failed to update workspace', isLoading: false });
        throw error;
      }
    },
    
    /**
     * 删除工作区
     * @param id 工作区ID
     * @returns Promise<boolean> 是否删除成功
     */
    deleteWorkspace: async (id: string) => {
      // 设置加载状态，清除错误
      set({ isLoading: true, error: null });
      try {
        if (isElectron) {
          // 在 Electron 环境中调用主进程方法
          const success = await window.electron!.ipcRenderer.invoke('workspace:delete', id);
          if (success) {
            // 更新状态
            set((state) => ({
              workspaces: state.workspaces.filter(workspace => workspace.id !== id),
              currentWorkspace: state.currentWorkspace?.id === id ? null : state.currentWorkspace,
              isLoading: false
            }));
          }
          return success;
        } else {
          // 浏览器环境的模拟实现
          set((state) => ({
            workspaces: state.workspaces.filter(workspace => workspace.id !== id),
            currentWorkspace: state.currentWorkspace?.id === id ? null : state.currentWorkspace,
            isLoading: false
          }));
          return true;
        }
      } catch (error) {
        // 处理错误
        set({ error: error instanceof Error ? error.message : 'Failed to delete workspace', isLoading: false });
        throw error;
      }
    },
    
    /**
     * 向工作区添加文件夹
     * @param workspaceId 工作区ID
     * @param folderPath 文件夹路径
     * @returns Promise<Workspace> 更新后的工作区对象
     */
    addFolderToWorkspace: async (workspaceId: string, folderPath: string) => {
      // 设置加载状态，清除错误
      set({ isLoading: true, error: null });
      try {
        if (isElectron) {
          // 在 Electron 环境中调用主进程方法
          const updatedWorkspace = await window.electron!.ipcRenderer.invoke('workspace:addFolder', workspaceId, folderPath);
          // 更新状态
          set((state) => ({
            workspaces: state.workspaces.map(workspace => 
              workspace.id === workspaceId ? updatedWorkspace : workspace
            ),
            currentWorkspace: state.currentWorkspace?.id === workspaceId ? updatedWorkspace : state.currentWorkspace,
            isLoading: false
          }));
          return updatedWorkspace;
        } else {
          // 浏览器环境的模拟实现
          const workspace = get().workspaces.find(w => w.id === workspaceId)!;
          const folderName = folderPath.split('/').pop() || folderPath;
          const newFolder: FolderLink = {
            id: Date.now().toString(),
            path: folderPath,
            name: folderName,
            isActive: true,
            lastAccessed: new Date().toISOString()
          };
          const updatedWorkspace = {
            ...workspace,
            folders: [...workspace.folders, newFolder],
            updatedAt: new Date().toISOString()
          };
          // 更新状态
          set((state) => ({
            workspaces: state.workspaces.map(workspace => 
              workspace.id === workspaceId ? updatedWorkspace : workspace
            ),
            currentWorkspace: state.currentWorkspace?.id === workspaceId ? updatedWorkspace : state.currentWorkspace,
            isLoading: false
          }));
          return updatedWorkspace;
        }
      } catch (error) {
        // 处理错误
        set({ error: error instanceof Error ? error.message : 'Failed to add folder', isLoading: false });
        throw error;
      }
    },
    
    /**
     * 从工作区移除文件夹
     * @param workspaceId 工作区ID
     * @param folderId 文件夹ID
     * @returns Promise<Workspace> 更新后的工作区对象
     */
    removeFolderFromWorkspace: async (workspaceId: string, folderId: string) => {
      // 设置加载状态，清除错误
      set({ isLoading: true, error: null });
      try {
        if (isElectron) {
          // 在 Electron 环境中调用主进程方法
          const updatedWorkspace = await window.electron!.ipcRenderer.invoke('workspace:removeFolder', workspaceId, folderId);
          // 更新状态
          set((state) => ({
            workspaces: state.workspaces.map(workspace => 
              workspace.id === workspaceId ? updatedWorkspace : workspace
            ),
            currentWorkspace: state.currentWorkspace?.id === workspaceId ? updatedWorkspace : state.currentWorkspace,
            isLoading: false
          }));
          return updatedWorkspace;
        } else {
          // 浏览器环境的模拟实现
          const workspace = get().workspaces.find(w => w.id === workspaceId)!;
          const updatedWorkspace = {
            ...workspace,
            folders: workspace.folders.filter(f => f.id !== folderId),
            updatedAt: new Date().toISOString()
          };
          // 更新状态
          set((state) => ({
            workspaces: state.workspaces.map(workspace => 
              workspace.id === workspaceId ? updatedWorkspace : workspace
            ),
            currentWorkspace: state.currentWorkspace?.id === workspaceId ? updatedWorkspace : state.currentWorkspace,
            isLoading: false
          }));
          return updatedWorkspace;
        }
      } catch (error) {
        // 处理错误
        set({ error: error instanceof Error ? error.message : 'Failed to remove folder', isLoading: false });
        throw error;
      }
    },
    
    /**
     * 更新文件夹链接
     * @param workspaceId 工作区ID
     * @param folderId 文件夹ID
     * @param updates 更新内容
     * @returns Promise<Workspace> 更新后的工作区对象
     */
    updateFolderLink: async (workspaceId: string, folderId: string, updates: Partial<FolderLink>) => {
      // 设置加载状态，清除错误
      set({ isLoading: true, error: null });
      try {
        if (isElectron) {
          // 在 Electron 环境中调用主进程方法
          const updatedWorkspace = await window.electron!.ipcRenderer.invoke('workspace:updateFolder', workspaceId, folderId, updates);
          // 更新状态
          set((state) => ({
            workspaces: state.workspaces.map(workspace => 
              workspace.id === workspaceId ? updatedWorkspace : workspace
            ),
            currentWorkspace: state.currentWorkspace?.id === workspaceId ? updatedWorkspace : state.currentWorkspace,
            isLoading: false
          }));
          return updatedWorkspace;
        } else {
          // 浏览器环境的模拟实现
          const workspace = get().workspaces.find(w => w.id === workspaceId)!;
          const updatedWorkspace = {
            ...workspace,
            folders: workspace.folders.map(folder => 
              folder.id === folderId ? { ...folder, ...updates, lastAccessed: new Date().toISOString() } : folder
            ),
            updatedAt: new Date().toISOString()
          };
          // 更新状态
          set((state) => ({
            workspaces: state.workspaces.map(workspace => 
              workspace.id === workspaceId ? updatedWorkspace : workspace
            ),
            currentWorkspace: state.currentWorkspace?.id === workspaceId ? updatedWorkspace : state.currentWorkspace,
            isLoading: false
          }));
          return updatedWorkspace;
        }
      } catch (error) {
        // 处理错误
        set({ error: error instanceof Error ? error.message : 'Failed to update folder', isLoading: false });
        throw error;
      }
    },
    
    /**
     * 选择文件夹
     * @returns Promise<string | null> 选择的文件夹路径，取消选择返回null
     */
    selectFolder: async () => {
      // 设置加载状态，清除错误
      set({ isLoading: true, error: null });
      try {
        if (isElectron) {
          // 在 Electron 环境中调用主进程方法
          const folderPath = await window.electron!.ipcRenderer.invoke('folder:select');
          // 更新状态
          set({ isLoading: false });
          return folderPath;
        } else {
          // 浏览器环境的模拟实现
          set({ isLoading: false });
          return '/mock/folder/path';
        }
      } catch (error) {
        // 处理错误
        set({ error: error instanceof Error ? error.message : 'Failed to select folder', isLoading: false });
        return null;
      }
    },
    
    /**
     * 设置当前工作区
     * @param workspace 工作区对象或null
     */
    setCurrentWorkspace: (workspace: Workspace | null) => {
      set({ currentWorkspace: workspace });
    },
    
    /**
     * 清除错误信息
     */
    clearError: () => {
      set({ error: null });
    }
  }
}));

// 导出类型
export type { Workspace, FolderLink };