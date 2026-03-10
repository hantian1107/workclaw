## ADDED Requirements

### Requirement: Workspace Configuration
The system SHALL allow defining workspaces as a collection of resource links (file paths, app paths) without moving physical files.

#### Scenario: Create Workspace
- **WHEN** a user creates a new workspace
- **THEN** a new configuration entry is created with a unique ID and empty resource list

#### Scenario: Add Resource
- **WHEN** a user adds a folder to a workspace
- **THEN** the folder path is added to the workspace's resource whitelist

### Requirement: Workspace Switching
The system SHALL allow dynamic switching of the active workspace for a session.

#### Scenario: Switch Workspace
- **WHEN** a user requests to switch to "Project B"
- **THEN** the session's `currentWorkspaceId` is updated and the sandbox reloads the corresponding whitelist
