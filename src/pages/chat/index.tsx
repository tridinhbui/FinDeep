//Reacct hooks = tools for managing state and side effects in react
//useNavigate = tool for navigating between pages
//Component = Pre-built pieces you can use 
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; 
import {
  ChatMessage,
  Attachment,
  OpenDocument,
  ViewerState,
} from "../../types/chat";
import { MessageItem } from "../../components/chat/MessageItem";
import { DocumentViewer } from "../../components/viewer/DocumentViewer";
import { FileUpload } from "../../components/chat/FileUpload";
import { SettingsPanel } from "../../components/settings/SettingsPanel";
import { CompactThemeToggle } from "../../components/settings/ThemeToggle";
import ChatHistorySidebar from "../../components/chat/ChatHistorySidebar";
import {
  saveViewerState,
  generateTabId,
  clearViewerState,
} from "../../lib/storage/viewerState";
import { apiService } from "../../services/api";

// Helper function for attachment icons
const getAttachmentIcon = (kind: string): string => {
  switch (kind) {
    case 'pdf':
      return '📄';
    case 'csv':
      return '📊';
    case 'markdown':
      return '📝';
    case 'text':
      return '📄';
    case 'html':
      return '🌐';
    case 'table':
      return '📋';
    default:
      return '📎';
  }
};

// Welcome message - clean start for new conversations
const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: `Welcome to FinDeep. How can I help you today?`,
};

//Component Interface = describes the props that a component can receive
//user = who is currently logged in
//onLogout = function to call when the user wants to sign out
//isAuthenticated = whether the user is logged in  or just a demo user
//realUser = the actual user object if authenticated, otherwise undefined
interface ChatWithPreviewProps {
  user: { email: string; name: string };
  onLogout: () => void;
  isAuthenticated?: boolean;
  realUser?: any;
}




export const ChatWithPreview: React.FC<ChatWithPreviewProps> = ({ user, onLogout, isAuthenticated = false, realUser }) => {
  //useNavigate = tool for navigating between pages
  const navigate = useNavigate();

//messages = all the chat messages (like a conversation history)
//inputValue = what is the user is typing right now
//isLoading = whether the AI is thinking (shows loading spinner)
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | undefined>();
  const [viewerState, setViewerState] = useState<ViewerState>({
    openDocs: [],
    activeTabId: null,
  });
  const [isViewerVisible, setIsViewerVisible] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileUploadRef = useRef<any>(null);

  // Load viewer state from session storage on mount
  useEffect(() => {
    // Clear any old demo files from previous sessions
    clearViewerState();
    setViewerState({
      openDocs: [],
      activeTabId: null,
    });
    setIsViewerVisible(false);
  }, []);

  // Auto-save chat to history when messages change (except for welcome message)
  useEffect(() => {
    if (messages.length > 1 && !messages.every(msg => msg.role === 'assistant')) {
      const saveToHistory = async () => {
        try {
          const stored = localStorage.getItem('findeep-chat-history');
          const history = stored ? JSON.parse(stored) : [];
          
          const chatTitle = messages.find(msg => msg.role === 'user' && msg.content)?.content || 'Untitled Chat';
          const newChat = {
            id: currentChatId || Date.now().toString(),
            title: chatTitle.length > 30 ? chatTitle.substring(0, 30) + '...' : chatTitle,
            messages: [...messages],
            date: new Date().toLocaleDateString(),
            timestamp: Date.now()
          };

          // Update existing chat or add new one
          const existingIndex = history.findIndex((chat: any) => chat.id === currentChatId);
          let updatedHistory;
          
          if (existingIndex >= 0) {
            updatedHistory = [...history];
            updatedHistory[existingIndex] = newChat;
          } else {
            updatedHistory = [newChat, ...history].slice(0, 20); // Keep only last 20
          }

          localStorage.setItem('findeep-chat-history', JSON.stringify(updatedHistory));
          setCurrentChatId(newChat.id);
        } catch (error) {
          console.error('Failed to save chat to history:', error);
        }
      };

      // Debounce saving to avoid too frequent saves
      const timeoutId = setTimeout(saveToHistory, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [messages, currentChatId]);

  // Save viewer state to session storage whenever it changes
  useEffect(() => {
    saveViewerState(viewerState);
  }, [viewerState]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const openAttachment = (attachment: Attachment) => {
    // Check if attachment is already open
    const existingDoc = viewerState.openDocs.find(
      (doc) => doc.attachment.id === attachment.id,
    );

    if (existingDoc) {
      // Just activate the existing tab
      setViewerState((prev) => ({
        ...prev,
        activeTabId: existingDoc.tabId,
      }));
    } else {
      // Open new tab
      const newTabId = generateTabId();
      const newDoc: OpenDocument = {
        id: attachment.id,
        attachment,
        tabId: newTabId,
      };

      setViewerState((prev) => ({
        openDocs: [...prev.openDocs, newDoc],
        activeTabId: newTabId,
      }));
    }

    // Show viewer if hidden
    setIsViewerVisible(true);
  };

  const closeTab = (tabId: string) => {
    setViewerState((prev) => {

      const newOpenDocs = prev.openDocs.filter((doc) => doc.tabId !== tabId);
      let newActiveTabId = prev.activeTabId;

      // If we're closing the active tab, select the last remaining tab
      if (prev.activeTabId === tabId) {
        newActiveTabId =
          newOpenDocs.length > 0
            ? newOpenDocs[newOpenDocs.length - 1].tabId
            : null;
      }

      return {
        openDocs: newOpenDocs,
        activeTabId: newActiveTabId,
      };
    });
  };

  const activateTab = (tabId: string) => {
    setViewerState((prev) => ({
      ...prev,
      activeTabId: tabId,
    }));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() && pendingAttachments.length === 0) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue.trim() || undefined, // Only include content if user typed something
      attachments: pendingAttachments.length > 0 ? [...pendingAttachments] : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setPendingAttachments([]);
    setIsLoading(true);

    try {
      // Call the AI API
      const response = await apiService.sendMessage({
        message: userMessage.content || "",
        attachments: userMessage.attachments,
        conversation_history: messages,
        userEmail: user.email,
      });

      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.message,
        attachments: response.attachments,
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Fallback error message
      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment.",
      };
      
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (attachments: Attachment[]) => {
    setPendingAttachments((prev) => [...prev, ...attachments]);
  };

  const handleClearChat = () => {
    setMessages([WELCOME_MESSAGE]);
    setViewerState({
      openDocs: [],
      activeTabId: null,
    });
    setIsViewerVisible(false);
    setCurrentChatId(undefined);
    // Clear the viewer state from session storage
    clearViewerState();
  };

  // Handle loading a chat from history
  const handleLoadChat = (chatHistory: ChatMessage[]) => {
    setMessages(chatHistory);
    setCurrentChatId(Date.now().toString());
  };

  // Handle new chat
  const handleNewChat = () => {
    handleClearChat();
    setCurrentChatId(undefined);
  };

  return (
    <div className="flex h-screen bg-white text-black">
      {/* Chat History Sidebar - Integrated */}
      {isHistoryOpen && (
        <>
          {/* Mobile Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsHistoryOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="relative z-50 w-80 border-r border-gray-200 bg-gray-50 flex-shrink-0">
            <ChatHistorySidebar
              isOpen={isHistoryOpen}
              onClose={() => setIsHistoryOpen(false)}
              currentChatId={currentChatId}
              onLoadChat={handleLoadChat}
              onNewChat={handleNewChat}
            />
          </div>
        </>
      )}

      {/* Chat Panel */}
      <div
        className={`flex flex-col transition-all duration-300 ${
          isViewerVisible ? (isHistoryOpen ? "flex-1" : "w-1/2") : (isHistoryOpen ? "flex-1" : "w-full")
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-white shadow-subtle">
          <div className="flex items-center gap-3">
            {/* Hamburger menu button for history */}
            <button
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Chat History"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-elegant">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <h1 className="text-xl font-bold text-black">
              FinDeep
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <CompactThemeToggle />
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-3 rounded-xl bg-gray-100 border border-gray-300 dark:border-border dark:border-border-dark-dark hover:bg-gray-200 hover:border-accent dark:hover:border-accent-dark transition-all duration-300 shadow-sm"
              title="Settings"
            >
              <svg className="w-5 h-5 text-text dark:text-text-dark-secondary dark:text-text dark:text-text-dark-secondary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button
              onClick={handleClearChat}
              className="p-3 rounded-xl bg-gray-100 border border-gray-300 dark:border-border dark:border-border-dark-dark hover:bg-gray-200 hover:border-accent dark:hover:border-accent-dark transition-all duration-300 shadow-sm"
              title="Clear Chat & Files"
            >
              <svg className="w-5 h-5 text-text dark:text-text-dark-secondary dark:text-text dark:text-text-dark-secondary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <button
              onClick={() => setIsViewerVisible(!isViewerVisible)}
              className="p-3 rounded-xl bg-gray-100 border border-gray-300 dark:border-border dark:border-border-dark-dark hover:bg-gray-200 hover:border-accent dark:hover:border-accent-dark transition-all duration-300 shadow-sm"
              title={isViewerVisible ? "Hide viewer" : "Show viewer"}
            >
              <svg
                className={`w-5 h-5 text-text dark:text-text-dark-secondary dark:text-text dark:text-text-dark-secondary-dark transition-transform duration-300 ${isViewerVisible ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
            
            {/* User Menu */}
            <div className="relative group">
              <button className="flex items-center gap-2 p-2 rounded-xl bg-secondary-light border border-border dark:border-border-dark hover:bg-surface-hover transition-all duration-300 shadow-subtle">
                <div className="w-8 h-8 rounded-full bg-primary dark:bg-primary-dark flex items-center justify-center">
                  <span className="text-secondary dark:text-secondary-dark font-medium text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-text dark:text-text-dark text-sm font-medium hidden sm:block">
                  {user.name}
                </span>
                <svg className="w-4 h-4 text-text dark:text-text-dark-secondary dark:text-text dark:text-text-dark-secondary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-border dark:border-border-dark rounded-xl shadow-elegant opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-2">
                  <div className="px-3 py-2 text-sm text-text dark:text-text-dark border-b border-border dark:border-border-dark">
                    {user.email}
                    {!isAuthenticated && (
                      <span className="ml-2 text-xs bg-secondary-light text-text dark:text-text-dark px-2 py-0.5 rounded-full border border-border dark:border-border-dark">
                        Demo
                      </span>
                    )}
                  </div>
                  {!isAuthenticated ? (
                    <button
                      onClick={() => {
                        // Clear any demo session data and redirect to login
                        localStorage.removeItem('findeep-demo-session');
                        navigate('/login');
                      }}
                            className="w-full text-left px-3 py-2 text-sm text-text dark:text-text-dark hover:bg-surface-hover rounded-lg transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => navigate('/profile')}
                            className="w-full text-left px-3 py-2 text-sm text-text dark:text-text-dark hover:bg-surface-hover rounded-lg transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile Settings
                      </button>
                      <button
                        onClick={() => {
                          // Navigate immediately to prevent demo user flash
                          navigate('/login');
                          // Clear auth state after navigation
                          onLogout();
                        }}
                            className="w-full text-left px-3 py-2 text-sm text-text dark:text-text-dark hover:bg-surface-hover rounded-lg transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
          {messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              onOpenAttachment={openAttachment}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Pending Attachments */}
        {pendingAttachments.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-300 bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-600">Pending files:</span>
              <button
                onClick={() => setPendingAttachments([])}
                className="text-xs text-black hover:text-gray-700 transition-colors"
              >
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {pendingAttachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center gap-2 px-3 py-1 bg-black/5 border border-black/20 rounded-lg text-xs"
                >
                  <span>{getAttachmentIcon(attachment.kind)}</span>
                  <span className="text-black truncate max-w-32">{attachment.title}</span>
                  <button
                    onClick={() => setPendingAttachments(prev => prev.filter(a => a.id !== attachment.id))}
                    className="text-black hover:text-gray-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-6 border-t border-border dark:border-border-dark bg-white">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <div className="flex-1 relative flex items-center">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything about your financial data..."
                className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-black focus:ring-2 focus:ring-black/20 transition-all duration-300 text-black placeholder-gray-500"
                disabled={isLoading}
              />
              <div className="relative">
                <FileUpload ref={fileUploadRef} onFileUpload={handleFileUpload} disabled={isLoading} />
              </div>
            </div>
            <button
              type="submit"
              disabled={(!inputValue.trim() && pendingAttachments.length === 0) || isLoading}
              className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium flex items-center gap-2 shadow-lg"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <span>Send</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Document Viewer Panel */}
      {isViewerVisible && (
        <div className="w-1/2 border-l border-border dark:border-border-dark">
          <DocumentViewer
            openDocs={viewerState.openDocs}
            activeTabId={viewerState.activeTabId}
            onCloseTab={closeTab}
            onActivate={activateTab}
          />
        </div>
      )}



      {/* Settings Panel */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};
