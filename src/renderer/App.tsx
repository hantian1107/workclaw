import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [workspaces] = useState<any[]>([
    { id: '1', name: '默认工作空间' },
    { id: '2', name: '项目 A' },
    { id: '3', name: '项目 B' }
  ]);
  const [conversations, setConversations] = useState<any[]>([
    { id: '1', title: '对话 1', lastMessage: 'Hello', timestamp: new Date().toISOString() },
    { id: '2', title: '对话 2', lastMessage: 'How are you?', timestamp: new Date().toISOString() }
  ]);
  const [selectedWorkspace, setSelectedWorkspace] = useState('1');
  const [selectedConversation, setSelectedConversation] = useState('1');
  const [messages, setMessages] = useState<any[]>([
    { id: '1', content: 'Hello', role: 'assistant', timestamp: new Date().toISOString() },
    { id: '2', content: 'Hi there!', role: 'user', timestamp: new Date().toISOString() }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 监听来自主进程的消息
    if (window.electron) {
      window.electron.onMessage((message) => {
        setMessages(prev => [...prev, {
          id: message.id,
          content: message.content,
          role: 'assistant',
          timestamp: message.timestamp
        }]);
      });
    }
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // 添加用户消息到界面
    const userMessage = {
      id: `msg-${Date.now()}`,
      content: inputMessage,
      role: 'user',
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // 发送消息到主进程
      if (window.electron) {
        window.electron.sendMessage({
          id: userMessage.id,
          content: userMessage.content,
          userId: 'local-user',
          timestamp: userMessage.timestamp,
          channelId: 'ipc-channel'
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
    }
  };

  const handleCreateConversation = () => {
    const newConversation = {
      id: `conv-${Date.now()}`,
      title: '新对话',
      lastMessage: '',
      timestamp: new Date().toISOString()
    };
    setConversations(prev => [...prev, newConversation]);
    setSelectedConversation(newConversation.id);
    setMessages([]);
  };

  return (
    <div className="app">
      <div className="app-container">
        {/* 左侧栏 */}
        <div className="sidebar">
          {/* 工作空间选择 */}
          <div className="workspace-section">
            <h2>工作空间</h2>
            <div className="workspace-list">
              {workspaces.map((workspace) => (
                <div
                  key={workspace.id}
                  className={`workspace-item ${selectedWorkspace === workspace.id ? 'active' : ''}`}
                  onClick={() => setSelectedWorkspace(workspace.id)}
                >
                  {workspace.name}
                </div>
              ))}
            </div>
            <button className="add-button">+ 添加工作空间</button>
          </div>

          {/* 对话管理 */}
          <div className="conversation-section">
            <div className="section-header">
              <h2>对话</h2>
              <button className="add-button" onClick={handleCreateConversation}>+</button>
            </div>
            <div className="conversation-list">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`conversation-item ${selectedConversation === conversation.id ? 'active' : ''}`}
                  onClick={() => setSelectedConversation(conversation.id)}
                >
                  <div className="conversation-title">{conversation.title}</div>
                  <div className="conversation-preview">{conversation.lastMessage}</div>
                  <div className="conversation-time">
                    {new Date(conversation.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 主内容区域 */}
        <div className="main-content">
          <div className="chat-container">
            <div className="messages">
              {messages.map((message) => (
                <div key={message.id} className={`message ${message.role}`}>
                  <div className="message-content">{message.content}</div>
                  <div className="message-time">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="message assistant loading">
                  <div className="loading-indicator">Thinking...</div>
                </div>
              )}
            </div>
            
            <div className="input-container">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message here..."
                className="message-input"
              />
              <button onClick={handleSendMessage} className="send-button">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
