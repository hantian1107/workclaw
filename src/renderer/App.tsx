import { useState } from 'react';
import './App.css';
import Chat from '../agent/components/Chat/Chat';
import WorkspaceList from './components/WorkspaceList';
import WorkspaceDetails from './components/WorkspaceDetails';

function App() {
  const [activeTab, setActiveTab] = useState('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div>
            <h2>Welcome to Workclaw</h2>
            <p>A local intelligent agent for file management and workspace organization.</p>
          </div>
        );
      case 'workspaces':
        return (
          <div className="workspace-container">
            <div className="workspace-list">
              <WorkspaceList />
            </div>
            <div className="workspace-details">
              <WorkspaceDetails />
            </div>
          </div>
        );
      case 'chat':
        return <Chat />;
      case 'settings':
        return (
          <div>
            <h2>Settings</h2>
            <p>Configure your application settings here.</p>
          </div>
        );
      default:
        return (
          <div>
            <h2>Welcome to Workclaw</h2>
            <p>A local intelligent agent for file management and workspace organization.</p>
          </div>
        );
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Workclaw</h1>
      </header>
      <main className="app-main">
        <div className="sidebar">
          <nav>
            <ul>
              <li 
                className={activeTab === 'home' ? 'active' : ''}
                onClick={() => setActiveTab('home')}
              >
                Home
              </li>
              <li 
                className={activeTab === 'workspaces' ? 'active' : ''}
                onClick={() => setActiveTab('workspaces')}
              >
                Workspaces
              </li>
              <li 
                className={activeTab === 'chat' ? 'active' : ''}
                onClick={() => setActiveTab('chat')}
              >
                Chat
              </li>
              <li 
                className={activeTab === 'settings' ? 'active' : ''}
                onClick={() => setActiveTab('settings')}
              >
                Settings
              </li>
            </ul>
          </nav>
        </div>
        <div className="content">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;