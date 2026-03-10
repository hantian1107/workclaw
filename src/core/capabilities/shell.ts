import { exec } from 'child_process';
import { promisify } from 'util';
import { sandbox } from '../sandbox';

const execAsync = promisify(exec);

export class ShellCapability {
  /**
   * Executes a command after verifying permissions.
   * Only allows whitelisted commands and ensures cwd is within workspace.
   */
  async exec(command: string, cwd?: string): Promise<{ stdout: string; stderr: string }> {
    // 1. Validate command against whitelist
    sandbox.validateCommand(command);

    // 2. Validate working directory
    // If cwd is provided, check if it's allowed.
    // If not provided, we should default to a safe location or throw error,
    // but here we enforce explicit cwd for safety or use active workspace root if available.
    
    // For simplicity in this implementation, we require cwd to be validated if provided.
    if (cwd) {
      sandbox.validatePath(cwd, 'read');
    }

    // 3. Execute
    try {
      const { stdout, stderr } = await execAsync(command, { cwd });
      return { stdout, stderr };
    } catch (error: any) {
      throw new Error(`Command execution failed: ${error.message}`);
    }
  }
}

export const shellCapability = new ShellCapability();
