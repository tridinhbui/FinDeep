import React, { useState, useEffect } from 'react';
import { ChatMessage } from '../../types/chat';

interface ChatHistoryItem {
  id: string;
  title: string;
  messages: ChatMessage[];
  date: string;
  timestamp: number;
}

interface ChatHistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentChatId?: string;
  onLoadChat: (chatHistory: ChatMessage[]) => void;
  onNewChat: () => void;
}

export const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
  isOpen,
  onClose,
  currentChatId,
  onLoadChat,
  onNewChat
}) => {
  const [chatHistoryList, setChatHistoryList] = useState<ChatHistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Load chat history from localStorage
  useEffect(() => {
    const loadChatHistory = () => {
      try {
        const stored = localStorage.getItem('findeep-chat-history');
        const history: ChatHistoryItem[] = stored ? JSON.parse(stored) : [];
        setChatHistoryList(history.sort((a, b) => b.timestamp - a.timestamp));
      } catch (error) {
        console.error('Failed to load chat history:', error);
        setChatHistoryList([]);
      }
    };

    loadChatHistory();
  }, []);


  // Generate a title from messages
  const generateChatTitle = (messages: ChatMessage[]): string => {
    const userMessages = messages.filter(msg => msg.role === 'user' && msg.content);
    if (userMessages.length === 0) return 'New Chat';
    
    const firstUserMessage = userMessages[0].content || '';
    return firstUserMessage.length > 30 
      ? firstUserMessage.substring(0, 30) + '...'
      : firstUserMessage;
  };

  // Handle loading a chat
  const handleLoadChat = (chatHistory: ChatHistoryItem) => {
    onLoadChat(chatHistory.messages);
    onClose();
  };

  // Handle creating a new chat
  const handleNewChat = () => {
    onNewChat();
    onClose();
  };

  // Handle deleting a chat
  const handleDeleteChat = (chatId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      const updatedHistory = chatHistoryList.filter(chat => chat.id !== chatId);
      localStorage.setItem('findeep-chat-history', JSON.stringify(updatedHistory));
      setChatHistoryList(updatedHistory);
    } catch (error) {
      console.error('Failed to delete chat:', error);
    }
  };

  // Clear all history
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all chat history?')) {
      localStorage.removeItem('findeep-chat-history');
      setChatHistoryList([]);
    }
  };

  // Filter chats based on search query
  const filteredHistory = chatHistoryList.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Backdrop - only on mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar - Now integrated */}
      <div className={`h-full bg-white flex flex-col transition-all duration-300 ease-in-out`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Chat History</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleNewChat}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="New Chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
              title="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {/* New Chat Button */}
          <div className="p-4">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center gap-3 p-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-dashed border-gray-300 hover:border-gray-400"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="font-medium">New Chat</span>
            </button>
          </div>

          {/* History List */}
          {filteredHistory.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              {searchQuery ? 'No conversations found' : 'No chat history yet'}
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredHistory.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => handleLoadChat(chat)}
                  className={`
                    group relative p-3 rounded-lg cursor-pointer transition-colors
                    ${currentChatId === chat.id 
                      ? 'bg-blue-50 border-l-4 border-l-blue-500' 
                      : 'hover:bg-gray-100'
                    }
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {chat.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {chat.messages.length} messages
                      </p>
                      <p className="text-xs text-gray-400">
                        {chat.date}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDeleteChat(chat.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                      title="Delete chat"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {chatHistoryList.length > 0 && (
          <div className="border-t border-gray-200 p-4">
            <button
              onClick={handleClearAll}
              className="w-full text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
              Clear all history
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default ChatHistorySidebar;
