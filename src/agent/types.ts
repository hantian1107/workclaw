/**
 * Agent 相关的通用类型定义
 */

/**
 * 消息角色
 */
export type Role = 'user' | 'assistant' | 'system' | 'tool';

/**
 * 消息对象
 */
export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  toolCallId?: string;
  name?: string;
}

/**
 * 工具调用
 */
export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string; // JSON string
  };
}

/**
 * 用户消息
 */
export interface UserMessage {
  channelId: string;
  userId: string;
  content: string;
  files?: string[]; // 附件链接
  metadata?: Record<string, any>;
}

/**
 * 技能接口
 */
export interface ISkill {
  name: string;
  description: string;
  execute(args: any, context: any): Promise<any>;
}

/**
 * 规划结果
 */
export interface PlanResult {
  action: 'chat' | 'tool_call';
  content: string;
  toolCall?: {
    name: string;
    args: any;
  };
}
