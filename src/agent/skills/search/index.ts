import type { ISkill } from '../../types';
import { browserCapability } from '../../../core/capabilities/browser';
import { llmService } from '../../core/llm';

export class SearchSkill implements ISkill {
  name = 'search';
  description = 'Search the web and retrieve information';

  async execute(args: any, context: any): Promise<any> {
    const { action, query, url } = args;

    switch (action) {
      case 'search':
        return await this.search(query);
      case 'open':
        return await this.open(url);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private async search(query: string): Promise<string> {
    try {
      await browserCapability.search(query);
      return `Opened browser to search for: ${query}`;
    } catch (error: any) {
      return `Error searching: ${error.message}`;
    }
  }

  private async open(url: string): Promise<string> {
    try {
      await browserCapability.open(url);
      return `Opened URL: ${url}`;
    } catch (error: any) {
      return `Error opening URL: ${error.message}`;
    }
  }
}

export const searchSkill = new SearchSkill();
