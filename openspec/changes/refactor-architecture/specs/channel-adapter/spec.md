## ADDED Requirements

### Requirement: Unified Channel Interface
The system SHALL provide a unified `IChannel` interface for all external communication adapters.

#### Scenario: Interface Compliance
- **WHEN** a new channel adapter is implemented
- **THEN** it must implement `start()`, `send()`, and `onMessage()` methods

### Requirement: IPC Channel Adapter
The system SHALL implement an IPC adapter to handle communication with the Electron Renderer process.

#### Scenario: Receive UI Message
- **WHEN** the UI sends a message via `ipcRenderer.invoke`
- **THEN** the IPC adapter converts it to a standard `UserMessage` and passes it to the SessionManager

### Requirement: Feishu Channel Adapter
The system SHALL implement a Feishu adapter to handle communication with the Feishu open platform.

#### Scenario: Webhook Handling
- **WHEN** Feishu sends a webhook event to the configured port
- **THEN** the adapter verifies the signature and parses the message content
