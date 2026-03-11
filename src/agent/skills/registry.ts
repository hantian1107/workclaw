import type { ISkill } from '../types';
import { codingSkill } from './coding';
import { writerSkill } from './writer';
import { searchSkill } from './search';

export class SkillRegistry {
  private skills: Map<string, ISkill> = new Map();

  constructor() {
    this.register(codingSkill);
    this.register(writerSkill);
    this.register(searchSkill);
  }

  public register(skill: ISkill): void {
    this.skills.set(skill.name, skill);
  }

  public get(name: string): ISkill | undefined {
    return this.skills.get(name);
  }

  public getAll(): ISkill[] {
    return Array.from(this.skills.values());
  }

  public getToolDefinitions(): any[] {
    return this.getAll().map(skill => ({
      type: 'function',
      function: {
        name: skill.name,
        description: skill.description,
        parameters: {
          type: 'object',
          properties: {
            action: { type: 'string' },
            // Note: This is a simplified schema. In a real app, 
            // each skill should define its own Zod schema or JSON schema.
            // We'll rely on the LLM to infer arguments based on description for now.
            args: { type: 'object' } 
          },
          required: ['action']
        }
      }
    }));
  }
}

export const skillRegistry = new SkillRegistry();
