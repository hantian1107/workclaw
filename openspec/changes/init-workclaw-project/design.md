## Context

We are building a local intelligent agent application (Workclaw) that provides file management, workspace organization, and AI-powered assistance capabilities. The application will be packaged as a desktop client using Electron, with a React + TypeScript frontend and Node.js backend logic.

## Goals / Non-Goals

**Goals:**
- Create a modular project structure with clear separation of concerns
- Implement core functionality including file operations, workspace management, AI dialogue, and Feishu integration
- Provide a modern, responsive user interface using Tailwind CSS and shadcn/ui
- Package the application as a cross-platform desktop client
- Ensure smooth integration between Electron main and renderer processes

**Non-Goals:**
- Remote server deployment (local use only)
- Multi-user collaboration features
- Cloud storage integration
- Advanced security features beyond basic file system access controls

## Decisions

1. **Project Architecture**
   - **Decision**: Use Electron with React + TypeScript
   - **Rationale**: Electron provides cross-platform desktop capabilities while React + TypeScript offers a modern, type-safe frontend development experience
   - **Alternatives Considered**: Native desktop development (more complex, platform-specific), web application (lacks local file system access)

2. **State Management**
   - **Decision**: Use Zustand for state management
   - **Rationale**: Lightweight, simple API, and good TypeScript support
   - **Alternatives Considered**: Redux (more complex, boilerplate code), Context API (limited for complex state)

3. **Styling**
   - **Decision**: Use Tailwind CSS with shadcn/ui
   - **Rationale**: Fast development, consistent design system, and excellent integration between the two
   - **Alternatives Considered**: Styled-components (more runtime overhead), CSS Modules (less flexible)

4. **AI Integration**
   - **Decision**: Use OpenAI API for LLM capabilities
   - **Rationale**: Well-documented, widely used, and provides powerful language models
   - **Alternatives Considered**: Other LLM APIs (Anthropic, Google), local LLMs (requires significant resources)

5. **File System Operations**
   - **Decision**: Use Node.js fs module with additional utilities
   - **Rationale**: Built-in to Node.js, reliable, and well-documented
   - **Alternatives Considered**: Third-party file system libraries (additional dependency)

6. **Build System**
   - **Decision**: Use Vite for frontend development and Electron Builder for packaging
   - **Rationale**: Vite provides fast development experience, while Electron Builder handles cross-platform packaging
   - **Alternatives Considered**: Webpack (slower development), manual packaging (more complex)

## Risks / Trade-offs

1. **Performance**
   - **Risk**: Electron applications can be resource-intensive
   - **Mitigation**: Optimize renderer process, use web workers for heavy tasks, and implement lazy loading

2. **Security**
   - **Risk**: Local file system access could be misused
   - **Mitigation**: Implement proper file access controls and validate user inputs

3. **Cross-platform Compatibility**
   - **Risk**: Differences in file system paths and behaviors across platforms
   - **Mitigation**: Use platform-agnostic file path utilities and test on all target platforms

4. **LLM API Reliability**
   - **Risk**: External API dependencies could cause downtime
   - **Mitigation**: Implement error handling and fallback mechanisms

5. **Package Size**
   - **Risk**: Electron applications can be large
   - **Mitigation**: Optimize dependencies, use code splitting, and implement compression