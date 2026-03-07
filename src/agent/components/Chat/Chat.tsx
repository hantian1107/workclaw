/**
 * 聊天组件
 * 提供与 AI 助手的聊天界面，支持发送消息、显示历史消息和执行命令
 */
import React, { useState, useEffect } from 'react';
import { llmService } from '../../core/llm';
import { contextManager } from '../../core/context';
import { commandExecutor } from '../../core/executor';
import './Chat.css';

/**
 * 消息接口
 * 定义聊天消息的结构
 */
interface Message {
  /** 消息角色，用户或助手 */
  role: 'user' | 'assistant';
  /** 消息内容 */
  content: string;
  /** 消息时间戳 */
  timestamp: Date;
}

/**
 * 聊天组件
 * @returns React.FC 聊天组件
 */
const Chat: React.FC = () => {
  /** 消息列表状态 */
  const [messages, setMessages] = useState<Message[]>([]);
  /** 输入框内容状态 */
  const [input, setInput] = useState('');
  /** 加载状态 */
  const [isLoading, setIsLoading] = useState(false);

  /**
   * 组件挂载时加载历史消息
   */
  useEffect(() => {
    // 加载历史消息
    const history = contextManager.getHistory();
    setMessages(history);
  }, []);

  /**
   * 处理发送消息
   */
  const handleSend = async () => {
    // 检查输入是否为空
    if (!input.trim()) return;

    // 添加用户消息
    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    // 更新消息列表和上下文
    setMessages(prev => [...prev, userMessage]);
    contextManager.addMessage('user', input);
    // 清空输入框
    setInput('');
    // 设置加载状态
    setIsLoading(true);

    try {
      // 生成智能体响应，使用最近的 10 条消息作为上下文
      const response = await llmService.generateWithContext(input, contextManager.getRecentMessages(10).map(msg => `${msg.role}: ${msg.content}`));
      
      // 解析响应中的命令
      const command = commandExecutor.parseCommand(response.text);
      if (command) {
        // 执行命令
        const commandResult = await commandExecutor.execute(command);
        
        // 添加智能体响应，包含命令执行结果
        const assistantMessage: Message = {
          role: 'assistant',
          content: `${response.text}\n\nCommand execution result: ${commandResult.message}`,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        contextManager.addMessage('assistant', assistantMessage.content);
      } else {
        // 添加智能体响应
        const assistantMessage: Message = {
          role: 'assistant',
          content: response.text,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        contextManager.addMessage('assistant', response.text);
      }
    } catch (error) {
      console.error('Error generating response:', error);
      
      // 添加错误消息
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again later.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      contextManager.addMessage('assistant', errorMessage.content);
    } finally {
      // 取消加载状态
      setIsLoading(false);
    }
  };

  /**
   * 处理键盘按键事件
   * @param e 键盘事件
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    // 按下 Enter 键且未按下 Shift 键时发送消息
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-container">
      {/* 消息列表 */}
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            <div className="message-content">{message.content}</div>
            <div className="message-time">{message.timestamp.toLocaleTimeString()}</div>
          </div>
        ))}
        {/* 加载状态 */}
        {isLoading && (
          <div className="message assistant">
            <div className="message-content">Thinking...</div>
          </div>
        )}
      </div>
      {/* 输入区域 */}
      <div className="chat-input">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message here..."
          className="chat-textarea"
        />
        <button onClick={handleSend} className="chat-send-button">
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;