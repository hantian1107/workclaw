class PromptManager {
  private systemPrompt = `You are Workclaw, a helpful AI assistant running on the user's local machine. You can assist with various tasks such as file management, code analysis, and system operations. Always prioritize the user's privacy and security. Only access files and directories that the user has explicitly authorized.`;

  private toolPromptTemplate = 'Tool execution result:\n\n{toolResult}\n\nPlease summarize this result in a natural, friendly way for the user.';

  buildPrompt(message: string, context: any): string {
    const recentMessages = context.conversationHistory || [];
    const workspaceInfo = context.workspaceId ? `Current workspace: ${context.workspaceId}` : 'No workspace selected';

    let prompt = `${this.systemPrompt}\n\n${workspaceInfo}\n\n`;

    // Add recent conversation history
    for (const msg of recentMessages) {
      if (msg.role === 'user') {
        prompt += `User: ${msg.content}\n`;
      } else if (msg.role === 'assistant') {
        prompt += `Assistant: ${msg.content}\n`;
      }
    }

    // Add the current user message
    prompt += `User: ${message}\nAssistant:`;

    return prompt;
  }

  buildToolPrompt(toolResult: string): string {
    return this.toolPromptTemplate.replace('{toolResult}', toolResult);
  }

  buildSystemPrompt(): string {
    return this.systemPrompt;
  }

  setSystemPrompt(prompt: string): void {
    this.systemPrompt = prompt;
  }

  buildRolePrompt(role: string): string {
    const rolePrompts: Record<string, string> = {
      'code': 'You are a skilled software developer. Provide clear, concise code solutions and explanations.',
      'writer': 'You are a professional writer. Create well-structured, engaging content.',
      'search': 'You are an efficient researcher. Find relevant information and present it clearly.',
      'system': 'You are a system administrator. Help with system operations and troubleshooting.'
    };

    return rolePrompts[role] || this.systemPrompt;
  }
}

export { PromptManager };
