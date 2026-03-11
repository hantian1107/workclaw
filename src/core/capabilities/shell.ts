import { exec, execSync, spawn } from 'child_process';

interface SpawnOptions {
  cwd?: string;
  env?: Record<string, string>;
  stdio?: any;
  detached?: boolean;
  killSignal?: string;
  timeout?: number;
}

interface ExecOptions {
  cwd?: string;
  env?: Record<string, string>;
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
    const child = spawn(command, args, options || {});
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`Command failed with exit code ${code}\nStderr: ${stderr}`));
      }
    });

    child.on('error', (error) => {
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
