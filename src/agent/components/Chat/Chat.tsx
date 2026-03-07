import React, { useState, useEffect } from 'react';
import { llmService } from '../../core/llm';
import { contextManager } from '../../core/context';
import { commandExecutor } from '../../core/executor';
import './Chat.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 加载历史消息
    const history = contextManager.getHistory();
    setMessages(history);
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    // 添加用户消息
    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    contextManager.addMessage('user', input);
    setInput('');
    setIsLoading(true);

    try {
      // 生成智能体响应
      const response = await llmService.generateWithContext(input, contextManager.getRecentMessages(10).map(msg => `${msg.role}: ${msg.content}`));
      
      // 解析响应中的命令
      const command = commandExecutor.parseCommand(response.text);
      if (command) {
        // 执行命令
        const commandResult = await commandExecutor.execute(command);
        
        // 添加智能体响应
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
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            <div className="message-content">{message.content}</div>
            <div className="message-time">{message.timestamp.toLocaleTimeString()}</div>
          </div>
        ))}
        {isLoading && (
          <div className="message assistant">
            <div className="message-content">Thinking...</div>
          </div>
        )}
      </div>
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