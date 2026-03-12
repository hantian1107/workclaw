import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import WorkspaceSelector from './component/WorkspaceSelector';
import ConversationList from './component/ConversationList';
import ChatView from './view/ChatView';
import WorkspaceManagementView from './view/WorkspaceManagementView';
import { api, type Workspace } from './service/api';

function App() {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [conversations, setConversations] = useState<any[]>([
    { id: '1', title: '对话 1', lastMessage: 'Hello', timestamp: new Date().toISOString() },
    { id: '2', title: '对话 2', lastMessage: 'How are you?', timestamp: new Date().toISOString() }
  ]);
  const [selectedWorkspace, setSelectedWorkspace] = useState('');
  const [selectedConversation, setSelectedConversation] = useState('1');
  const [messages, setMessages] = useState<any[]>([
    { id: '1', content: 'Hello', role: 'assistant', timestamp: new Date().toISOString() },
    { id: '2', content: 'Hi there!', role: 'user', timestamp: new Date().toISOString() }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 获取工作空间列表
    const fetchWorkspaces = async () => {
      try {
        const list = await api.workspace.list();
        setWorkspaces(list);
        // 如果没有选中的工作空间且列表不为空，默认选中第一个
        if (list.length > 0) {
          setSelectedWorkspace(prev => prev || list[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch workspaces:', error);
      }
    };

    fetchWorkspaces();

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

  const handleCreateWorkspace = async (name: string) => {
    try {
      const newWorkspace = await api.workspace.create(name, '');
      setWorkspaces(prev => [...prev, newWorkspace]);
    } catch (error) {
      console.error('Failed to create workspace:', error);
    }
  };

  const handleAddResource = async (workspaceId: string, resourcePath: string) => {
    try {
      // 默认添加为文件类型，权限为只读
      await api.workspace.addResource(workspaceId, {
        path: resourcePath,
        type: 'file',
        permissions: 'read'
      });
      // 重新获取列表以刷新显示
      const list = await api.workspace.list();
      setWorkspaces(list);
    } catch (error) {
      console.error('Failed to add resource:', error);
    }
  };

  return (
    <div className="app">
      <div className="app-container">
        {/* 路由配置 */}
        <Routes>
          <Route path="/" element={
            <>
              {/* 左侧栏 */}
              <div className="sidebar">
                <WorkspaceSelector
                  workspaces={workspaces}
                  selectedWorkspace={selectedWorkspace}
                  onSelectWorkspace={setSelectedWorkspace}
                  onManageWorkspace={() => navigate('/workspace-management')}
                />
                <ConversationList
                  conversations={conversations}
                  selectedConversation={selectedConversation}
                  onSelectConversation={setSelectedConversation}
                  onCreateConversation={handleCreateConversation}
                />
              </div>

              {/* 主内容区域 */}
              <ChatView
                messages={messages}
                inputMessage={inputMessage}
                isLoading={isLoading}
                onSendMessage={handleSendMessage}
                onInputChange={setInputMessage}
              />
            </>
          } />
          
          <Route path="/workspace-management" element={
            <WorkspaceManagementView
              workspaces={workspaces}
              onCreateWorkspace={handleCreateWorkspace}
              onAddResource={handleAddResource}
            />
          } />
        </Routes>
      </div>
    </div>
  );
}

export default App;
