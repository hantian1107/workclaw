/**
 * 工作区详情组件
 * 显示当前选中工作区的详细信息，包括工作区名称、描述、文件夹列表等
 */
import React, { useState } from 'react';
import { useWorkspaceStore } from '../stores/workspaceStore';
import type { FolderLink } from '../stores/workspaceStore';

/**
 * 工作区详情组件
 * @returns React.FC 工作区详情组件
 */
const WorkspaceDetails: React.FC = () => {
  // 从工作区状态管理中获取状态和操作方法
  const { currentWorkspace, isLoading, error, actions } = useWorkspaceStore();
  
  // 编辑文件夹状态
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  // 编辑的文件夹名称
  const [editedName, setEditedName] = useState<string>('');

  /**
   * 处理添加文件夹
   * 调用 selectFolder 方法选择文件夹，然后添加到当前工作区
   */
  const handleAddFolder = async () => {
    // 调用选择文件夹方法
    const folderPath = await actions.selectFolder();
    // 如果选择了文件夹且当前有工作区，则添加到工作区
    if (folderPath && currentWorkspace) {
      await actions.addFolderToWorkspace(currentWorkspace.id, folderPath);
    }
  };

  /**
   * 处理移除文件夹
   * @param folderId 文件夹ID
   * @param folderName 文件夹名称
   */
  const handleRemoveFolder = async (folderId: string, folderName: string) => {
    // 确认是否移除文件夹
    if (currentWorkspace && window.confirm(`Are you sure you want to remove ${folderName}?`)) {
      await actions.removeFolderFromWorkspace(currentWorkspace.id, folderId);
    }
  };

  /**
   * 处理编辑文件夹
   * @param folder 文件夹对象
   */
  const handleEditFolder = (folder: FolderLink) => {
    // 设置编辑状态和编辑的名称
    setEditingFolder(folder.id);
    setEditedName(folder.name);
  };

  /**
   * 处理保存文件夹编辑
   * @param folderId 文件夹ID
   */
  const handleSaveFolder = async (folderId: string) => {
    // 如果有当前工作区且编辑名称不为空，则更新文件夹
    if (currentWorkspace && editedName) {
      await actions.updateFolderLink(currentWorkspace.id, folderId, { name: editedName });
      // 清除编辑状态
      setEditingFolder(null);
      setEditedName('');
    }
  };

  /**
   * 处理切换文件夹激活状态
   * @param folderId 文件夹ID
   * @param currentStatus 当前状态
   */
  const handleToggleFolder = async (folderId: string, currentStatus: boolean) => {
    if (currentWorkspace) {
      // 切换激活状态
      await actions.updateFolderLink(currentWorkspace.id, folderId, { isActive: !currentStatus });
    }
  };

  // 如果没有选择工作区，显示提示信息
  if (!currentWorkspace) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <p className="text-lg font-medium">Select a workspace to view details</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-50 p-6">
      {/* 工作区标题和添加文件夹按钮 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{currentWorkspace.name}</h2>
          {currentWorkspace.description && (
            <p className="text-gray-600 mt-1">{currentWorkspace.description}</p>
          )}
        </div>
        <button
          onClick={handleAddFolder}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Folder
        </button>
      </div>

      {/* 错误信息显示 */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg">
          {error}
        </div>
      )}

      {/* 文件夹列表 */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Folders</h3>
          <span className="text-sm text-gray-500">{currentWorkspace.folders.length} folders</span>
        </div>
        
        {/* 加载状态 */}
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : currentWorkspace.folders.length === 0 ? (
          {/* 无文件夹状态 */}
          <div className="flex flex-col items-center justify-center h-40 bg-white rounded-lg border border-dashed border-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <p className="text-gray-500">No folders added</p>
            <p className="text-sm text-gray-400 mt-2">Click "Add Folder" to add local folders</p>
          </div>
        ) : (
          {/* 文件夹列表 */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            {currentWorkspace.folders.map((folder) => (
              <div
                key={folder.id}
                className={`p-4 border-b border-gray-100 last:border-b-0 transition-colors ${
                  !folder.isActive ? 'bg-gray-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* 激活状态复选框 */}
                  <div className="flex-shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      checked={folder.isActive}
                      onChange={() => handleToggleFolder(folder.id, folder.isActive)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                  
                  {/* 文件夹信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      
                      {/* 编辑状态或显示状态 */}
                      {editingFolder === folder.id ? (
                        <div className="flex-1">
                          <input
                            type="text"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            className="w-full border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onBlur={() => handleSaveFolder(folder.id)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSaveFolder(folder.id)}
                            autoFocus
                          />
                        </div>
                      ) : (
                        <div className="flex-1 min-w-0">
                          <div className="text-gray-800 font-medium truncate">{folder.name}</div>
                          <div className="text-xs text-gray-500 truncate mt-1">{folder.path}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            Last accessed: {new Date(folder.lastAccessed).toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* 操作按钮 */}
                  <div className="flex items-center gap-2">
                    {editingFolder === folder.id ? (
                      {/* 保存按钮 */}
                      <button
                        onClick={() => handleSaveFolder(folder.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                        aria-label="Save changes"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    ) : (
                      {/* 编辑按钮 */}
                      <button
                        onClick={() => handleEditFolder(folder)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                        aria-label="Edit folder"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    )}
                    
                    {/* 删除按钮 */}
                    <button
                      onClick={() => handleRemoveFolder(folder.id, folder.name)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      aria-label="Remove folder"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 工作区信息 */}
      <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Workspace Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Created:</span>
            <span className="ml-2 text-gray-800">{new Date(currentWorkspace.createdAt).toLocaleString()}</span>
          </div>
          <div>
            <span className="text-gray-500">Updated:</span>
            <span className="ml-2 text-gray-800">{new Date(currentWorkspace.updatedAt).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceDetails;