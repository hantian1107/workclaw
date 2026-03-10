## ADDED Requirements

### Requirement: Logical Sandbox
The system SHALL intercept all capability calls and enforce access control based on the active workspace's whitelist.

#### Scenario: Allowed Path Access
- **WHEN** a capability attempts to access a file within a whitelisted directory
- **THEN** the operation is allowed to proceed

#### Scenario: Denied Path Access
- **WHEN** a capability attempts to access a file outside whitelisted directories
- **THEN** the operation is blocked and a `SecurityError` is thrown

### Requirement: Path Traversal Prevention
The system SHALL strictly validate paths to prevent traversal attacks (e.g., `../`).

#### Scenario: Path Normalization
- **WHEN** a path containing `..` is provided
- **THEN** the system resolves it to an absolute path before checking against the whitelist
