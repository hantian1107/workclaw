import React, { useState } from 'react';
import { useWorkspaceStore } from '../stores/workspaceStore';
import type { FolderLink } from '../stores/workspaceStore';

const WorkspaceDetails: React.FC = () => {
  const { currentWorkspace, isLoading, error, actions } = useWorkspaceStore();
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [editedName, setEditedName] = useState<string>('');

  const handleAddFolder = async () => {
    const folderPath = await actions.selectFolder();
    if (folderPath && currentWorkspace) {
      await actions.addFolderToWorkspace(currentWorkspace.id, folderPath);
    }
  };

  const handleRemoveFolder = async (folderId: string, folderName: string) => {
    if (currentWorkspace && window.confirm(`Are you sure you want to remove ${folderName}?`)) {
      await actions.removeFolderFromWorkspace(currentWorkspace.id, folderId);
    }
  };

  const handleEditFolder = (folder: FolderLink) => {
    setEditingFolder(folder.id);
    setEditedName(folder.name);
  };

  const handleSaveFolder = async (folderId: string) => {
    if (currentWorkspace && editedName) {
      await actions.updateFolderLink(currentWorkspace.id, folderId, { name: editedName });
      setEditingFolder(null);
      setEditedName('');
    }
  };

  const handleToggleFolder = async (folderId: string, currentStatus: boolean) => {
    if (currentWorkspace) {
      await actions.updateFolderLink(currentWorkspace.id, folderId, { isActive: !currentStatus });
    }
  };

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

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg">
          {error}
        </div>
      )}

      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Folders</h3>
          <span className="text-sm text-gray-500">{currentWorkspace.folders.length} folders</span>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : currentWorkspace.folders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 bg-white rounded-lg border border-dashed border-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <p className="text-gray-500">No folders added</p>
            <p className="text-sm text-gray-400 mt-2">Click "Add Folder" to add local folders</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            {currentWorkspace.folders.map((folder) => (
              <div
                key={folder.id}
                className={`p-4 border-b border-gray-100 last:border-b-0 transition-colors ${
                  !folder.isActive ? 'bg-gray-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      checked={folder.isActive}
                      onChange={() => handleToggleFolder(folder.id, folder.isActive)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      
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
                  
                  <div className="flex items-center gap-2">
                    {editingFolder === folder.id ? (
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