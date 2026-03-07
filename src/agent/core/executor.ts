import { fileSystemService } from '../../main/fileSystem';

interface Command {
  type: string;
  parameters: Record<string, any>;
}

interface CommandResult {
  success: boolean;
  message: string;
  data?: any;
}

class CommandExecutor {
  // 执行命令
  async execute(command: Command): Promise<CommandResult> {
    try {
      // 检查命令参数是否有效
      if (!command.parameters) {
        return {
          success: false,
          message: 'No command parameters provided'
        };
      }

      switch (command.type) {
        case 'file:open':
          if (!command.parameters.filePath) {
            return {
              success: false,
              message: 'File path is required for file:open command'
            };
          }
          return await this.executeOpenFile({ filePath: command.parameters.filePath });
        case 'file:save':
          if (!command.parameters.filePath || !command.parameters.content) {
            return {
              success: false,
              message: 'File path and content are required for file:save command'
            };
          }
          return await this.executeSaveFile({ 
            filePath: command.parameters.filePath, 
            content: command.parameters.content 
          });
        case 'file:list':
          if (!command.parameters.directoryPath) {
            return {
              success: false,
              message: 'Directory path is required for file:list command'
            };
          }
          return await this.executeListDirectory({ directoryPath: command.parameters.directoryPath });
        default:
          return {
            success: false,
            message: `Unknown command type: ${command.type}`
          };
      }
    } catch (error) {
      console.error('Error executing command:', error);
      return {
        success: false,
        message: `Error executing command: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // 执行打开文件命令
  private async executeOpenFile(parameters: { filePath: string }): Promise<CommandResult> {
    const { filePath } = parameters;
    
    if (!filePath) {
      return {
        success: false,
        message: 'File path is required'
      };
    }

    try {
      const content = await fileSystemService.openFile(filePath);
      return {
        success: true,
        message: 'File opened successfully',
        data: { content }
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to open file: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // 执行保存文件命令
  private async executeSaveFile(parameters: { filePath: string; content: string }): Promise<CommandResult> {
    const { filePath, content } = parameters;
    
    if (!filePath || !content) {
      return {
        success: false,
        message: 'File path and content are required'
      };
    }

    try {
      await fileSystemService.saveFile(filePath, content);
      return {
        success: true,
        message: 'File saved successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to save file: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // 执行列出目录命令
  private async executeListDirectory(parameters: { directoryPath: string }): Promise<CommandResult> {
    const { directoryPath } = parameters;
    
    if (!directoryPath) {
      return {
        success: false,
        message: 'Directory path is required'
      };
    }

    try {
      const entries = await fileSystemService.listDirectory(directoryPath);
      return {
        success: true,
        message: 'Directory listed successfully',
        data: { entries }
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to list directory: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // 解析命令字符串
  parseCommand(commandString: string): Command | null {
    try {
      // 这里是命令解析的占位符
      // 实际实现时需要根据具体的命令格式进行解析
      console.log('Parsing command:', commandString);
      
      // 只有当命令字符串中包含特定命令格式时才解析
      // 例如，只有当消息以 "!file:open" 等命令前缀开头时才解析
      if (commandString.includes('!file:open') || 
          commandString.includes('!file:save') || 
          commandString.includes('!file:list')) {
        // 模拟解析
        return {
          type: 'file:open',
          parameters: {
            filePath: 'C:\\example.txt'
          }
        };
      }
      
      // 如果不是命令，返回 null
      return null;
    } catch (error) {
      console.error('Error parsing command:', error);
      return null;
    }
  }
}

export const commandExecutor = new CommandExecutor();