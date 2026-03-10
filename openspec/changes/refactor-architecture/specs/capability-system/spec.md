## ADDED Requirements

### Requirement: Atomic Capabilities
The system SHALL provide a set of atomic capabilities that perform low-level operations.

#### Scenario: File Capability
- **WHEN** `FileCapability.read` is called
- **THEN** it calls the Sandbox to verify the path, then uses `fs.readFile`

#### Scenario: Shell Capability
- **WHEN** `ShellCapability.exec` is called
- **THEN** it calls the Sandbox to verify the command and path, then executes it
