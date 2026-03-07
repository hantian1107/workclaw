import { create } from 'zustand';

// Extend Window interface to include electron property
declare global {
  interface Window {
    electron?: {
      ipcRenderer: {
        invoke: <T = any>(channel: string, ...args: any[]) => Promise<T>;
      };
    };
  }
}

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

interface WorkspaceState {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  isLoading: boolean;
  error: string | null;
  actions: {
    createWorkspace: (name: string, description: string) => Promise<Workspace>;
    getWorkspaces: () => Promise<void>;
    updateWorkspace: (id: string, updates: Partial<Workspace>) => Promise<Workspace>;
    deleteWorkspace: (id: string) => Promise<boolean>;
    addFolderToWorkspace: (workspaceId: string, folderPath: string) => Promise<Workspace>;
    removeFolderFromWorkspace: (workspaceId: string, folderId: string) => Promise<Workspace>;
    updateFolderLink: (workspaceId: string, folderId: string, updates: Partial<FolderLink>) => Promise<Workspace>;
    selectFolder: () => Promise<string | null>;
    setCurrentWorkspace: (workspace: Workspace | null) => void;
    clearError: () => void;
  };
}

// Check if electron is available (Electron environment)
const isElectron = typeof window !== 'undefined' && !!window.electron;

// Mock data for development in browser
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

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: isElectron ? [] : mockWorkspaces,
  currentWorkspace: null,
  isLoading: false,
  error: null,
  actions: {
    createWorkspace: async (name: string, description: string) => {
      set({ isLoading: true, error: null });
      try {
        if (isElectron) {
          const workspace = await window.electron!.ipcRenderer.invoke('workspace:create', name, description);
          set((state) => ({
            workspaces: [...state.workspaces, workspace],
            isLoading: false
          }));
          return workspace;
        } else {
          // Mock implementation for browser
          const workspace: Workspace = {
            id: Date.now().toString(),
            name,
            description,
            folders: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          set((state) => ({
            workspaces: [...state.workspaces, workspace],
            isLoading: false
          }));
          return workspace;
        }
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to create workspace', isLoading: false });
        throw error;
      }
    },
    
    getWorkspaces: async () => {
      set({ isLoading: true, error: null });
      try {
        if (isElectron) {
          const workspaces = await window.electron!.ipcRenderer.invoke('workspace:list');
          set({ workspaces, isLoading: false });
        } else {
          // Use mock data in browser
          set({ workspaces: mockWorkspaces, isLoading: false });
        }
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to get workspaces', isLoading: false });
      }
    },
    
    updateWorkspace: async (id: string, updates: Partial<Workspace>) => {
      set({ isLoading: true, error: null });
      try {
        if (isElectron) {
          const updatedWorkspace = await window.electron!.ipcRenderer.invoke('workspace:update', id, updates);
          set((state) => ({
            workspaces: state.workspaces.map(workspace => 
              workspace.id === id ? updatedWorkspace : workspace
            ),
            currentWorkspace: state.currentWorkspace?.id === id ? updatedWorkspace : state.currentWorkspace,
            isLoading: false
          }));
          return updatedWorkspace;
        } else {
          // Mock implementation for browser
          const updatedWorkspace = {
            ...get().workspaces.find(w => w.id === id)!, 
            ...updates,
            updatedAt: new Date().toISOString()
          };
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
        set({ error: error instanceof Error ? error.message : 'Failed to update workspace', isLoading: false });
        throw error;
      }
    },
    
    deleteWorkspace: async (id: string) => {
      set({ isLoading: true, error: null });
      try {
        if (isElectron) {
          const success = await window.electron!.ipcRenderer.invoke('workspace:delete', id);
          if (success) {
            set((state) => ({
              workspaces: state.workspaces.filter(workspace => workspace.id !== id),
              currentWorkspace: state.currentWorkspace?.id === id ? null : state.currentWorkspace,
              isLoading: false
            }));
          }
          return success;
        } else {
          // Mock implementation for browser
          set((state) => ({
            workspaces: state.workspaces.filter(workspace => workspace.id !== id),
            currentWorkspace: state.currentWorkspace?.id === id ? null : state.currentWorkspace,
            isLoading: false
          }));
          return true;
        }
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to delete workspace', isLoading: false });
        throw error;
      }
    },
    
    addFolderToWorkspace: async (workspaceId: string, folderPath: string) => {
      set({ isLoading: true, error: null });
      try {
        if (isElectron) {
          const updatedWorkspace = await window.electron!.ipcRenderer.invoke('workspace:addFolder', workspaceId, folderPath);
          set((state) => ({
            workspaces: state.workspaces.map(workspace => 
              workspace.id === workspaceId ? updatedWorkspace : workspace
            ),
            currentWorkspace: state.currentWorkspace?.id === workspaceId ? updatedWorkspace : state.currentWorkspace,
            isLoading: false
          }));
          return updatedWorkspace;
        } else {
          // Mock implementation for browser
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
        set({ error: error instanceof Error ? error.message : 'Failed to add folder', isLoading: false });
        throw error;
      }
    },
    
    removeFolderFromWorkspace: async (workspaceId: string, folderId: string) => {
      set({ isLoading: true, error: null });
      try {
        if (isElectron) {
          const updatedWorkspace = await window.electron!.ipcRenderer.invoke('workspace:removeFolder', workspaceId, folderId);
          set((state) => ({
            workspaces: state.workspaces.map(workspace => 
              workspace.id === workspaceId ? updatedWorkspace : workspace
            ),
            currentWorkspace: state.currentWorkspace?.id === workspaceId ? updatedWorkspace : state.currentWorkspace,
            isLoading: false
          }));
          return updatedWorkspace;
        } else {
          // Mock implementation for browser
          const workspace = get().workspaces.find(w => w.id === workspaceId)!;
          const updatedWorkspace = {
            ...workspace,
            folders: workspace.folders.filter(f => f.id !== folderId),
            updatedAt: new Date().toISOString()
          };
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
        set({ error: error instanceof Error ? error.message : 'Failed to remove folder', isLoading: false });
        throw error;
      }
    },
    
    updateFolderLink: async (workspaceId: string, folderId: string, updates: Partial<FolderLink>) => {
      set({ isLoading: true, error: null });
      try {
        if (isElectron) {
          const updatedWorkspace = await window.electron!.ipcRenderer.invoke('workspace:updateFolder', workspaceId, folderId, updates);
          set((state) => ({
            workspaces: state.workspaces.map(workspace => 
              workspace.id === workspaceId ? updatedWorkspace : workspace
            ),
            currentWorkspace: state.currentWorkspace?.id === workspaceId ? updatedWorkspace : state.currentWorkspace,
            isLoading: false
          }));
          return updatedWorkspace;
        } else {
          // Mock implementation for browser
          const workspace = get().workspaces.find(w => w.id === workspaceId)!;
          const updatedWorkspace = {
            ...workspace,
            folders: workspace.folders.map(folder => 
              folder.id === folderId ? { ...folder, ...updates, lastAccessed: new Date().toISOString() } : folder
            ),
            updatedAt: new Date().toISOString()
          };
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
        set({ error: error instanceof Error ? error.message : 'Failed to update folder', isLoading: false });
        throw error;
      }
    },
    
    selectFolder: async () => {
      set({ isLoading: true, error: null });
      try {
        if (isElectron) {
          const folderPath = await window.electron!.ipcRenderer.invoke('folder:select');
          set({ isLoading: false });
          return folderPath;
        } else {
          // Mock implementation for browser
          set({ isLoading: false });
          return '/mock/folder/path';
        }
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to select folder', isLoading: false });
        return null;
      }
    },
    
    setCurrentWorkspace: (workspace: Workspace | null) => {
      set({ currentWorkspace: workspace });
    },
    
    clearError: () => {
      set({ error: null });
    }
  }
}));

export type { Workspace, FolderLink };