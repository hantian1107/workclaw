import * as fs from 'fs';
import * as path from 'path';

interface ReadOptions {
  encoding?: BufferEncoding;
  flag?: string;
}

interface WriteOptions {
  encoding?: BufferEncoding;
  flag?: string;
  mode?: number;
}

interface ListOptions {
  recursive?: boolean;
  filter?: (name: string) => boolean;
}

async function read(filePath: string, options?: ReadOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, options || { encoding: 'utf8' }, (err: NodeJS.ErrnoException | null, data: string | Buffer) => {
      if (err) {
        reject(new Error(`Error reading file: ${err.message}`));
      } else {
        resolve(data.toString());
      }
    });
  });
}

async function write(filePath: string, content: string, options?: WriteOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    // 确保目录存在
    const dir = path.dirname(filePath);
    fs.mkdirSync(dir, { recursive: true });

    const writeOptions: fs.WriteFileOptions = {
      encoding: options?.encoding || 'utf8',
      flag: options?.flag,
      mode: options?.mode
    };

    fs.writeFile(filePath, content, writeOptions, (err: NodeJS.ErrnoException | null) => {
      if (err) {
        reject(new Error(`Error writing file: ${err.message}`));
      } else {
        resolve(`File written successfully: ${filePath}`);
      }
    });
  });
}

async function deleteFile(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        reject(new Error(`Error deleting file: ${err.message}`));
      } else {
        resolve(`File deleted successfully: ${filePath}`);
      }
    });
  });
}

async function list(directoryPath: string, options?: ListOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readdir(directoryPath, (err, files) => {
      if (err) {
        reject(new Error(`Error listing directory: ${err.message}`));
      } else {
        let filteredFiles = files;
        if (options?.filter) {
          filteredFiles = files.filter(options.filter);
        }
        resolve(JSON.stringify(filteredFiles, null, 2));
      }
    });
  });
}

async function exists(filePath: string): Promise<boolean> {
  return new Promise((resolve) => {
    fs.exists(filePath, resolve);
  });
}

async function stat(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
      if (err) {
        reject(new Error(`Error getting file stats: ${err.message}`));
      } else {
        resolve(JSON.stringify({
          size: stats.size,
          atime: stats.atime.toISOString(),
          mtime: stats.mtime.toISOString(),
          ctime: stats.ctime.toISOString(),
          birthtime: stats.birthtime.toISOString(),
          isFile: stats.isFile(),
          isDirectory: stats.isDirectory(),
          isSymbolicLink: stats.isSymbolicLink()
        }, null, 2));
      }
    });
  });
}

export {
  read,
  write,
  deleteFile as delete,
  list,
  exists,
  stat
};
