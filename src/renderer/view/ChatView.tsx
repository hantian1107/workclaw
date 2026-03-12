import React from 'react';

interface Message {
  id: string;
  content: string;
  role: string;
  timestamp: string;
}

interface ChatViewProps {
  messages: Message[];
  inputMessage: string;
  isLoading: boolean;
  onSendMessage: () => void;
  onInputChange: (value: string) => void;
}

const ChatView: React.FC<ChatViewProps> = ({
  messages,
  inputMessage,
  isLoading,
  onSendMessage,
  onInputChange
}) => {
  return (
    <div className="main-content">
      <div className="chat-container">
        <div className="messages">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.role}`}>
              <div className="message-content">{message.content}</div>
              <div className="message-time">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message assistant loading">
              <div className="loading-indicator">Thinking...</div>
            </div>
          )}
        </div>
        
        <div className="input-container">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
            placeholder="Type your message here..."
            className="message-input"
          />
          <button onClick={onSendMessage} className="send-button">
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
