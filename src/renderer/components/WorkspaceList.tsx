import React, { useEffect } from 'react';
import { useWorkspaceStore } from '../stores/workspaceStore';

const WorkspaceList = () => {
  const { workspaces, isLoading, error, actions } = useWorkspaceStore();

  useEffect(() => {
    actions.getWorkspaces();
  }, []);

  const handleSelectWorkspace = (workspace: any) => {
    actions.setCurrentWorkspace(workspace);
  };

  const handleDeleteWorkspace = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this workspace?')) {
      await actions.deleteWorkspace(id);
    }
  };

  return (
    <div>
      <div>
        <h2>Workspaces</h2>
        <button 
          onClick={() => {
            const name = prompt('Enter workspace name:');
            const description = prompt('Enter workspace description (optional):');
            if (name) {
              actions.createWorkspace(name, description || '');
            }
          }}
        >
          Create Workspace
        </button>
      </div>

      {error && (
        <div>
          {error}
        </div>
      )}

      {isLoading ? (
        <div>Loading...</div>
      ) : workspaces.length === 0 ? (
        <div>
          <p>No workspaces yet</p>
          <p>Create your first workspace to get started</p>
        </div>
      ) : (
        <div>
          {workspaces.map((workspace) => (
            <div
              key={workspace.id}
              onClick={() => handleSelectWorkspace(workspace)}
            >
              <div>
                <h3>{workspace.name}</h3>
                {workspace.description && (
                  <p>{workspace.description}</p>
                )}
                <div>
                  <span>{workspace.folders.length} folders</span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteWorkspace(workspace.id);
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkspaceList;