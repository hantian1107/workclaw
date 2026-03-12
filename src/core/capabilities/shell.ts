import { exec, execSync, spawn } from 'child_process';
import type { SpawnOptions as NodeSpawnOptions } from 'child_process';

interface SpawnOptions {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  stdio?: any;
  detached?: boolean;
  killSignal?: NodeJS.Signals | number;
  timeout?: number;
}

interface ExecOptions {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  timeout?: number;
  maxBuffer?: number;
}

async function execCommand(command: string, options?: ExecOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(command, options || {}, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`Command execution failed: ${error.message}\nStderr: ${stderr}`));
      } else {
        resolve(stdout || stderr);
      }
    });
  });
}

function execCommandSync(command: string, options?: ExecOptions): string {
  try {
    return execSync(command, options || {}).toString();
  } catch (error) {
    throw new Error(`Command execution failed: ${(error as Error).message}`);
  }
}

function killProcess(pid: number): string {
  try {
    process.kill(pid);
    return `Process ${pid} killed successfully`;
  } catch (error) {
    throw new Error(`Failed to kill process: ${(error as Error).message}`);
  }
}

async function spawnCommand(command: string, args: string[], options?: SpawnOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    const spawnOpts: NodeSpawnOptions = {
      cwd: options?.cwd,
      env: options?.env,
      detached: options?.detached,
      timeout: options?.timeout,
      killSignal: options?.killSignal
    };

    if (options?.stdio) {
      spawnOpts.stdio = options.stdio;
    }

    const child = spawn(command, args, spawnOpts);
    let stdout = '';
    let stderr = '';

    if (child.stdout) {
      child.stdout.on('data', (data: Buffer) => {
        stdout += data.toString();
      });
    }

    if (child.stderr) {
      child.stderr.on('data', (data: Buffer) => {
        stderr += data.toString();
      });
    }

    child.on('close', (code: number) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`Command failed with exit code ${code}\nStderr: ${stderr}`));
      }
    });

    child.on('error', (error: Error) => {
      reject(new Error(`Spawn failed: ${error.message}`));
    });
  });
}

export {
  execCommand as exec,
  execCommandSync,
  killProcess as kill,
  spawnCommand as spawn
};
