## ADDED Requirements

### Requirement: Web Search
The system SHALL provide a skill to search the web for information.

#### Scenario: Find Documentation
- **WHEN** user asks about a library's API
- **THEN** the search skill uses the browser capability to find relevant documentation

### Requirement: Information Retrieval
The system SHALL provide a skill to retrieve information from search results.

#### Scenario: Answer Question
- **WHEN** user asks a question that requires external knowledge
- **THEN** the search skill performs a search and summarizes the findings
