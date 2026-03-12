import React from 'react';

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversation: string;
  onSelectConversation: (id: string) => void;
  onCreateConversation: () => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversation,
  onSelectConversation,
  onCreateConversation
}) => {
  return (
    <div className="conversation-section">
      <div className="section-header">
        <h2>对话</h2>
        <button className="add-button" onClick={onCreateConversation}>+</button>
      </div>
      <div className="conversation-list">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            className={`conversation-item ${selectedConversation === conversation.id ? 'active' : ''}`}
            onClick={() => onSelectConversation(conversation.id)}
          >
            <div className="conversation-title">{conversation.title}</div>
            <div className="conversation-preview">{conversation.lastMessage}</div>
            <div className="conversation-time">
              {new Date(conversation.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversationList;
