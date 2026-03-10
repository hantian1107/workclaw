import path from 'path';
import { workspaceManager, WorkspaceConfig } from './workspace';

export class SecurityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SecurityError';
  }
}

export class Sandbox {
  private workspaceManager: typeof workspaceManager;

  constructor(manager = workspaceManager) {
    this.workspaceManager = manager;
  }

  /**
   * Validates if a file path is allowed within the current active workspace.
   * Throws SecurityError if access is denied.
   */
  public validatePath(targetPath: string, mode: 'read' | 'write' = 'read'): string {
    const activeWorkspace = this.workspaceManager.getActiveWorkspace();
    
    if (!activeWorkspace) {
      throw new SecurityError('No active workspace found. Operation denied.');
    }

    // Resolve absolute path to prevent traversal attacks (e.g., ../)
    const resolvedPath = path.resolve(targetPath);

    // Check if path is within any of the allowed resources
    const isAllowed = activeWorkspace.resources.some(resource => {
      const resourcePath = path.resolve(resource.path);
      
      // Allow exact match or subdirectory match
      // We add a separator to ensure we don't match partial folder names (e.g. /foo matching /foobar)
      return resolvedPath === resourcePath || resolvedPath.startsWith(resourcePath + path.sep);
    });

    if (!isAllowed) {
      throw new SecurityError(`Access denied: Path '${targetPath}' is not in the active workspace whitelist.`);
    }

    return resolvedPath;
  }

  /**
   * Validates if a command is allowed to be executed.
   * Currently implements a simple whitelist of safe commands.
   */
  public validateCommand(command: string): void {
    const safeCommands = ['ls', 'echo', 'cat', 'grep', 'find', 'git', 'npm', 'node'];
    const cmdName = command.split(' ')[0];

    if (!safeCommands.includes(cmdName)) {
      throw new SecurityError(`Command '${cmdName}' is not allowed in the sandbox.`);
    }
  }
}

export const sandbox = new Sandbox();
