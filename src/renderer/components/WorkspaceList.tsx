/**
 * 工作区列表组件
 * 显示所有工作区，支持创建、选择和删除工作区
 */
import React, { useEffect } from 'react';
import { useWorkspaceStore } from '../stores/workspaceStore';

/**
 * 工作区列表组件
 * @returns React.FC 工作区列表组件
 */
const WorkspaceList: React.FC = () => {
  // 从工作区状态管理中获取状态和操作方法
  const { workspaces, currentWorkspace, isLoading, error, actions } = useWorkspaceStore();

  // 组件挂载时获取工作区列表
  useEffect(() => {
    actions.getWorkspaces();
  }, []);

  /**
   * 处理选择工作区
   * @param workspace 工作区对象
   */
  const handleSelectWorkspace = (workspace: any) => {
    actions.setCurrentWorkspace(workspace);
  };

  /**
   * 处理删除工作区
   * @param id 工作区ID
   */
  const handleDeleteWorkspace = async (id: string) => {
    // 确认是否删除工作区
    if (window.confirm('Are you sure you want to delete this workspace?')) {
      await actions.deleteWorkspace(id);
    }
  };

  return (
    <div className="w-full h-full bg-gray-50 p-4">
      {/* 标题和创建按钮 */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Workspaces</h2>
        <button 
          onClick={() => {
            // 提示用户输入工作区名称和描述
            const name = prompt('Enter workspace name:');
            const description = prompt('Enter workspace description (optional):');
            if (name) {
              // 创建工作区
              actions.createWorkspace(name, description || '');
            }
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Workspace
        </button>
      </div>

      {/* 错误信息显示 */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg">
          {error}
        </div>
      )}

      {/* 加载状态 */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : workspaces.length === 0 ? (
        {/* 无工作区状态 */}
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
          </svg>
          <p className="text-lg font-medium">No workspaces yet</p>
          <p className="text-sm mt-2">Create your first workspace to get started</p>
        </div>
      ) : (
        {/* 工作区列表 */}
        <div className="grid grid-cols-1 gap-4">
          {workspaces.map((workspace) => (
            <div
              key={workspace.id}
              className={`p-5 rounded-lg border cursor-pointer transition-all ${
                currentWorkspace?.id === workspace.id
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
              }`}
              onClick={() => handleSelectWorkspace(workspace)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <h3 className="font-semibold text-gray-800 text-lg">{workspace.name}</h3>
                  </div>
                  {/* 显示工作区描述 */}
                  {workspace.description && (
                    <p className="text-sm text-gray-600 mt-2 ml-9">{workspace.description}</p>
                  )}
                  {/* 显示文件夹数量 */}
                  <div className="mt-3 flex items-center gap-1 ml-9">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm text-gray-500">{workspace.folders.length} folders</span>
                  </div>
                </div>
                {/* 删除按钮 */}
                <button
                  onClick={(e) => {
                    // 阻止事件冒泡，避免触发选择工作区
                    e.stopPropagation();
                    handleDeleteWorkspace(workspace.id);
                  }}
                  className="p-2 text-red-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                  aria-label="Delete workspace"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkspaceList;