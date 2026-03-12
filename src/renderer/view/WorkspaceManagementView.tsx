import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type Workspace } from '../service/api';

interface WorkspaceManagementViewProps {
  workspaces: Workspace[];
  onCreateWorkspace: (name: string) => void;
  onAddResource: (workspaceId: string, resource: string) => void;
}

const WorkspaceManagementView: React.FC<WorkspaceManagementViewProps> = ({
  workspaces,
  onCreateWorkspace,
  onAddResource
}) => {
  const navigate = useNavigate();
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(workspaces[0]?.id || '');
  const [resourcePath, setResourcePath] = useState('');

  const handleCreate = () => {
    if (newWorkspaceName.trim()) {
      onCreateWorkspace(newWorkspaceName);
      setNewWorkspaceName('');
    }
  };

  const handleAddResource = () => {
    if (selectedWorkspaceId && resourcePath.trim()) {
      onAddResource(selectedWorkspaceId, resourcePath);
      setResourcePath('');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 p-6 md:p-10 overflow-y-auto">
      <div className="max-w-5xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-2">
          <button
            onClick={() => navigate('/')}
            className="group flex items-center justify-center p-2.5 rounded-full bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 text-slate-500 hover:text-slate-700 transition-all duration-200"
            title="返回首页"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">工作空间管理</h2>
            <p className="text-slate-500 mt-1">管理您的工作区和相关资源配置</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Existing Workspaces */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-700">现有工作空间</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                  {workspaces.length} 个
                </span>
              </div>
              <div className="p-6">
                {workspaces.length > 0 ? (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {workspaces.map(ws => (
                      <li
                        key={ws.id}
                        className="group flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md hover:shadow-blue-500/5 transition-all duration-200 cursor-default"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                            <span className="text-sm font-bold">{ws.name.charAt(0).toUpperCase()}</span>
                          </div>
                          <span className="font-medium text-slate-700 group-hover:text-slate-900 truncate max-w-[120px]">{ws.name}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-10 text-slate-400">
                    <p>暂无工作空间，请在右侧创建</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Actions */}
          <div className="space-y-6">
            {/* Create Workspace */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center space-x-2 mb-4">
                <div className="p-1.5 bg-green-100 text-green-600 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-700">新建工作空间</h3>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  placeholder="输入名称，例如：项目 A"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 text-slate-700"
                />
                <button
                  onClick={handleCreate}
                  disabled={!newWorkspaceName.trim()}
                  className="w-full px-4 py-2.5 bg-slate-900 hover:bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow active:scale-[0.98]"
                >
                  创建工作空间
                </button>
              </div>
            </div>

            {/* Add Resource */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center space-x-2 mb-4">
                <div className="p-1.5 bg-purple-100 text-purple-600 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-700">关联资源</h3>
              </div>
              <div className="space-y-3">
                <div className="relative">
                  <select
                    value={selectedWorkspaceId}
                    onChange={(e) => setSelectedWorkspaceId(e.target.value)}
                    className="w-full appearance-none px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-slate-700"
                  >
                    {workspaces.map(ws => (
                      <option key={ws.id} value={ws.id}>{ws.name}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <input
                  type="text"
                  value={resourcePath}
                  onChange={(e) => setResourcePath(e.target.value)}
                  placeholder="资源路径或 URL"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all placeholder:text-slate-400 text-slate-700"
                />
                <button
                  onClick={handleAddResource}
                  disabled={!resourcePath.trim() || !selectedWorkspaceId}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 hover:border-purple-500 hover:text-purple-600 disabled:border-slate-200 disabled:text-slate-300 disabled:cursor-not-allowed text-slate-700 font-medium rounded-xl transition-all duration-200"
                >
                  添加资源
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceManagementView;
