import { ISkill } from '../../types';
import { fileCapability } from '../../../core/capabilities/file';
import { llmService } from '../../core/llm';

export class CodingSkill implements ISkill {
  name = 'coding';
  description = 'Read, write, list files and analyze code';

  async execute(args: any, context: any): Promise<any> {
    const { action, path, content, query } = args;

    switch (action) {
      case 'read':
        return await this.readFile(path);
      case 'write':
        return await this.writeFile(path, content);
      case 'list':
        return await this.listFiles(path);
      case 'analyze':
        return await this.analyzeCode(path, query);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private async readFile(filePath: string): Promise<string> {
    try {
      return await fileCapability.read(filePath);
    } catch (error: any) {
      return `Error reading file ${filePath}: ${error.message}`;
    }
  }

  private async writeFile(filePath: string, content: string): Promise<string> {
    try {
      await fileCapability.write(filePath, content);
      return `Successfully wrote to ${filePath}`;
    } catch (error: any) {
      return `Error writing file ${filePath}: ${error.message}`;
    }
  }

  private async listFiles(dirPath: string): Promise<string[]> {
    try {
      return await fileCapability.list(dirPath);
    } catch (error: any) {
      throw new Error(`Error listing directory ${dirPath}: ${error.message}`);
    }
  }

  private async analyzeCode(filePath: string, query: string): Promise<string> {
    try {
      const code = await this.readFile(filePath);
      const prompt = `
Analyze the following code from file "${filePath}":

\`\`\`
${code}
\`\`\`

Query: ${query}

Provide a detailed analysis and, if applicable, code improvements.
      `;

      const response = await llmService.chat([
        { role: 'system', content: 'You are an expert software engineer.' },
        { role: 'user', content: prompt }
      ]);

      return response.choices[0].message.content || 'No analysis generated.';
    } catch (error: any) {
      return `Error analyzing code: ${error.message}`;
    }
  }
}

export const codingSkill = new CodingSkill();
