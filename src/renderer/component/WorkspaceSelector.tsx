import React from 'react';

interface Workspace {
  id: string;
  name: string;
}

interface WorkspaceSelectorProps {
  workspaces: Workspace[];
  selectedWorkspace: string;
  onSelectWorkspace: (id: string) => void;
  onManageWorkspace: () => void;
}

const WorkspaceSelector: React.FC<WorkspaceSelectorProps> = ({
  workspaces,
  selectedWorkspace,
  onSelectWorkspace,
  onManageWorkspace
}) => {
  return (
    <div className="workspace-section">
      <h2>工作空间</h2>
      <div className="workspace-list">
        {workspaces.map((workspace) => (
          <div
            key={workspace.id}
            className={`workspace-item ${selectedWorkspace === workspace.id ? 'active' : ''}`}
            onClick={() => onSelectWorkspace(workspace.id)}
          >
            {workspace.name}
          </div>
        ))}
      </div>
      <button className="add-button" onClick={onManageWorkspace}>管理工作空间</button>
    </div>
  );
};

export default WorkspaceSelector;
