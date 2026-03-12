import { Sandbox } from './sandbox';
import { WorkspaceManager } from '../workspace/workspace';
import * as fileCapability from './capabilities/file';
import * as shellCapability from './capabilities/shell';
import * as browserCapability from './capabilities/browser';

class Core {
  private sandbox: Sandbox;
  private workspaceManager: WorkspaceManager;

  constructor(workspaceManager: WorkspaceManager) {
    this.workspaceManager = workspaceManager;
    this.sandbox = new Sandbox(workspaceManager);
  }

  async executeTool(toolCall: any): Promise<string> {
    if (!toolCall || !toolCall.tool_call) {
      return 'Error: Invalid tool call format';
    }

    const { name, params } = toolCall.tool_call;
    
    // 解析工具名称和操作
    const [capability, operation] = name.split('.');
    
    try {
      switch (capability) {
        case 'file':
          return await this.executeFileOperation(operation, params);
        case 'shell':
          return await this.executeShellOperation(operation, params);
        case 'browser':
          return await this.executeBrowserOperation(operation, params);
        default:
          return `Error: Unknown capability: ${capability}`;
      }
    } catch (error) {
      console.error('Error executing tool:', error);
      return `Error: ${(error as Error).message}`;
    }
  }

  private async executeFileOperation(operation: string, params: any): Promise<string> {
    const { path, content, options } = params;
    
    // 检查权限
    if (!this.sandbox.checkAccess(path, 'read')) {
      return 'Error: Access denied to file';
    }

    switch (operation) {
      case 'read':
        return await this.sandbox.execute(() => fileCapability.read(path, options));
      case 'write':
        if (!this.sandbox.checkAccess(path, 'write')) {
          return 'Error: Access denied to write file';
        }
        return await this.sandbox.execute(() => fileCapability.write(path, content, options));
      case 'delete':
        if (!this.sandbox.checkAccess(path, 'write')) {
          return 'Error: Access denied to delete file';
        }
        return await this.sandbox.execute(() => fileCapability.delete(path));
      case 'list':
        return await this.sandbox.execute(() => fileCapability.list(path, options));
      default:
        return `Error: Unknown file operation: ${operation}`;
    }
  }

  private async executeShellOperation(operation: string, params: any): Promise<string> {
    const { command, options } = params;
    
    // 检查权限
    if (operation !== 'kill' && !this.sandbox.checkShellAccess(command)) {
      return 'Error: Access denied to execute command';
    }

    switch (operation) {
      case 'exec':
        return await this.sandbox.execute(() => shellCapability.exec(command, options));
      case 'kill':
        const { pid } = params;
        return await this.sandbox.execute(async () => shellCapability.kill(pid));
      default:
        return `Error: Unknown shell operation: ${operation}`;
    }
  }

  private async executeBrowserOperation(operation: string, params: any): Promise<string> {
    const { url, options } = params;

    switch (operation) {
      case 'open':
        return await this.sandbox.execute(() => browserCapability.open(url, options));
      case 'getContent':
        return await this.sandbox.execute(() => browserCapability.getContent(url, options));
      default:
        return `Error: Unknown browser operation: ${operation}`;
    }
  }

  getSandbox(): Sandbox {
    return this.sandbox;
  }

  getWorkspaceManager(): WorkspaceManager {
    return this.workspaceManager;
  }
}

export { Core };
