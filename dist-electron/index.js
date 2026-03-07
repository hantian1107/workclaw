import { app, BrowserWindow, ipcMain, dialog } from "electron";
import * as path from "path";
import path__default from "path";
import { fileURLToPath } from "url";
import * as fs from "fs";
import fs__default from "fs";
class FileSystemService {
  // 打开文件
  async openFile(filePath) {
    try {
      const content = await fs.promises.readFile(filePath, "utf8");
      return content;
    } catch (error) {
      console.error("Error opening file:", error);
      throw new Error("Failed to open file");
    }
  }
  // 保存文件
  async saveFile(filePath, content) {
    try {
      const dirPath = path.dirname(filePath);
      if (!fs.existsSync(dirPath)) {
        await fs.promises.mkdir(dirPath, { recursive: true });
      }
      await fs.promises.writeFile(filePath, content, "utf8");
    } catch (error) {
      console.error("Error saving file:", error);
      throw new Error("Failed to save file");
    }
  }
  // 列出目录内容
  async listDirectory(dirPath) {
    try {
      const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
      return entries.map((entry) => ({
        name: entry.name,
        type: entry.isDirectory() ? "directory" : "file",
        path: path.join(dirPath, entry.name)
      }));
    } catch (error) {
      console.error("Error listing directory:", error);
      throw new Error("Failed to list directory");
    }
  }
  // 检查文件是否存在
  fileExists(filePath) {
    return fs.existsSync(filePath);
  }
  // 获取文件信息
  async getFileInfo(filePath) {
    try {
      return await fs.promises.stat(filePath);
    } catch (error) {
      console.error("Error getting file info:", error);
      throw new Error("Failed to get file info");
    }
  }
}
const fileSystemService = new FileSystemService();
class WorkspaceService {
  storagePath;
  workspaces;
  constructor() {
    this.storagePath = path__default.join(app.getPath("appData"), "workclaw", "workspaces.json");
    this.workspaces = [];
    this.loadWorkspaces();
  }
  ensureStoragePath() {
    const dir = path__default.dirname(this.storagePath);
    if (!fs__default.existsSync(dir)) {
      fs__default.mkdirSync(dir, { recursive: true });
    }
  }
  loadWorkspaces() {
    try {
      this.ensureStoragePath();
      if (fs__default.existsSync(this.storagePath)) {
        const data = fs__default.readFileSync(this.storagePath, "utf8");
        this.workspaces = JSON.parse(data);
      }
    } catch (error) {
      console.error("Failed to load workspaces:", error);
      this.workspaces = [];
    }
  }
  saveWorkspaces() {
    try {
      this.ensureStoragePath();
      fs__default.writeFileSync(this.storagePath, JSON.stringify(this.workspaces, null, 2));
    } catch (error) {
      console.error("Failed to save workspaces:", error);
    }
  }
  createWorkspace(name, description = "") {
    const existingWorkspace = this.workspaces.find((w) => w.name === name);
    if (existingWorkspace) {
      throw new Error("Workspace with this name already exists");
    }
    const workspace = {
      id: Date.now().toString(),
      name,
      description,
      folders: [],
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.workspaces.push(workspace);
    this.saveWorkspaces();
    return workspace;
  }
  getWorkspaces() {
    return this.workspaces;
  }
  getWorkspace(id) {
    return this.workspaces.find((w) => w.id === id);
  }
  updateWorkspace(id, updates) {
    const index = this.workspaces.findIndex((w) => w.id === id);
    if (index === -1) {
      return void 0;
    }
    this.workspaces[index] = {
      ...this.workspaces[index],
      ...updates,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.saveWorkspaces();
    return this.workspaces[index];
  }
  deleteWorkspace(id) {
    const index = this.workspaces.findIndex((w) => w.id === id);
    if (index === -1) {
      return false;
    }
    this.workspaces.splice(index, 1);
    this.saveWorkspaces();
    return true;
  }
  addFolderToWorkspace(workspaceId, folderPath) {
    const workspace = this.getWorkspace(workspaceId);
    if (!workspace) {
      return void 0;
    }
    const existingFolder = workspace.folders.find((f) => f.path === folderPath);
    if (existingFolder) {
      existingFolder.isActive = true;
      existingFolder.lastAccessed = (/* @__PURE__ */ new Date()).toISOString();
    } else {
      const folderName = path__default.basename(folderPath);
      const folderLink = {
        id: Date.now().toString(),
        path: folderPath,
        name: folderName,
        isActive: true,
        lastAccessed: (/* @__PURE__ */ new Date()).toISOString()
      };
      workspace.folders.push(folderLink);
    }
    workspace.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    this.saveWorkspaces();
    return workspace;
  }
  removeFolderFromWorkspace(workspaceId, folderId) {
    const workspace = this.getWorkspace(workspaceId);
    if (!workspace) {
      return void 0;
    }
    workspace.folders = workspace.folders.filter((f) => f.id !== folderId);
    workspace.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    this.saveWorkspaces();
    return workspace;
  }
  updateFolderLink(workspaceId, folderId, updates) {
    const workspace = this.getWorkspace(workspaceId);
    if (!workspace) {
      return void 0;
    }
    const folderIndex = workspace.folders.findIndex((f) => f.id === folderId);
    if (folderIndex === -1) {
      return void 0;
    }
    workspace.folders[folderIndex] = {
      ...workspace.folders[folderIndex],
      ...updates,
      lastAccessed: (/* @__PURE__ */ new Date()).toISOString()
    };
    workspace.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    this.saveWorkspaces();
    return workspace;
  }
}
const workspaceService = new WorkspaceService();
const __filename$1 = fileURLToPath(import.meta.url);
const __dirname$1 = path__default.dirname(__filename$1);
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path__default.join(__dirname$1, "preload.js"),
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    const distPath = path__default.join(process.cwd(), "dist", "index.html");
    mainWindow.loadFile(distPath);
  }
}
app.whenReady().then(() => {
  createWindow();
  app.on("activate", function() {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on("window-all-closed", function() {
  if (process.platform !== "darwin") app.quit();
});
ipcMain.on("file:open", async (event, filePath) => {
  try {
    const content = await fileSystemService.openFile(filePath);
    event.reply("file:open:success", content);
  } catch (error) {
    event.reply("file:open:error", error instanceof Error ? error.message : "Unknown error");
  }
});
ipcMain.on("file:save", async (event, filePath, content) => {
  try {
    await fileSystemService.saveFile(filePath, content);
    event.reply("file:save:success");
  } catch (error) {
    event.reply("file:save:error", error instanceof Error ? error.message : "Unknown error");
  }
});
ipcMain.on("directory:list", async (event, directoryPath) => {
  try {
    const entries = await fileSystemService.listDirectory(directoryPath);
    event.reply("directory:list:success", entries);
  } catch (error) {
    event.reply("directory:list:error", error instanceof Error ? error.message : "Unknown error");
  }
});
ipcMain.on("workspace:create", (event, name, description) => {
  try {
    const workspace = workspaceService.createWorkspace(name, description);
    event.reply("workspace:create:success", workspace);
  } catch (error) {
    event.reply("workspace:error", error instanceof Error ? error.message : "Unknown error");
  }
});
ipcMain.on("workspace:list", (event) => {
  try {
    const workspaces = workspaceService.getWorkspaces();
    event.reply("workspace:list:success", workspaces);
  } catch (error) {
    event.reply("workspace:error", error instanceof Error ? error.message : "Unknown error");
  }
});
ipcMain.on("workspace:update", (event, id, updates) => {
  try {
    const workspace = workspaceService.updateWorkspace(id, updates);
    event.reply("workspace:update:success", workspace);
  } catch (error) {
    event.reply("workspace:error", error instanceof Error ? error.message : "Unknown error");
  }
});
ipcMain.on("workspace:delete", (event, id) => {
  try {
    const success = workspaceService.deleteWorkspace(id);
    event.reply("workspace:delete:success", success);
  } catch (error) {
    event.reply("workspace:error", error instanceof Error ? error.message : "Unknown error");
  }
});
ipcMain.on("workspace:addFolder", (event, workspaceId, folderPath) => {
  try {
    const workspace = workspaceService.addFolderToWorkspace(workspaceId, folderPath);
    event.reply("workspace:addFolder:success", workspace);
  } catch (error) {
    event.reply("workspace:error", error instanceof Error ? error.message : "Unknown error");
  }
});
ipcMain.on("workspace:removeFolder", (event, workspaceId, folderId) => {
  try {
    const workspace = workspaceService.removeFolderFromWorkspace(workspaceId, folderId);
    event.reply("workspace:removeFolder:success", workspace);
  } catch (error) {
    event.reply("workspace:error", error instanceof Error ? error.message : "Unknown error");
  }
});
ipcMain.on("workspace:updateFolder", (event, workspaceId, folderId, updates) => {
  try {
    const workspace = workspaceService.updateFolderLink(workspaceId, folderId, updates);
    event.reply("workspace:updateFolder:success", workspace);
  } catch (error) {
    event.reply("workspace:error", error instanceof Error ? error.message : "Unknown error");
  }
});
ipcMain.handle("folder:select", async () => {
  try {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory"],
      title: "Select Folder"
    });
    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0];
    } else {
      return null;
    }
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Unknown error");
  }
});
