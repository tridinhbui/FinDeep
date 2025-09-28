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
  const [isTogglingHistory, setIsTogglingHistory] = useState(false);
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
            // Update existing chat
            updatedHistory = [...history];
            updatedHistory[existingIndex] = newChat;
          } else {
            // Add new chat and deduplicate by ID
            updatedHistory = [newChat, ...history]
              .filter((chat, index, self) => 
                self.findIndex(c => c.id === chat.id) === index
              )
              .slice(0, 20); // Keep only last 20
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
    <div className="flex h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      {/* Chat History Sidebar - Integrated */}
      <>
        {/* Mobile Backdrop - Only show when open and on mobile */}
        {isHistoryOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ease-in-out"
            onClick={() => setIsHistoryOpen(false)}
          />
        )}
        
        {/* Sidebar with smoother animation */}
        <div className={`
          relative overflow-hidden transition-all duration-300 ease-in-out
          ${isHistoryOpen ? 'w-80 opacity-100' : 'w-0 opacity-0'}
          flex-shrink-0
        `}>
          <div className={`
            w-80 h-full border-r border-[var(--color-border)] bg-[var(--color-bg-secondary)] 
            transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
            ${isHistoryOpen 
              ? 'translate-x-0' 
              : '-translate-x-full'
            }
          `}>
            <ChatHistorySidebar
              isOpen={isHistoryOpen}
              onClose={() => setIsHistoryOpen(false)}
              currentChatId={currentChatId}
              onLoadChat={handleLoadChat}
              onNewChat={handleNewChat}
            />
          </div>
        </div>
      </>

      {/* Chat Panel */}
      <div
        className={`flex flex-col transition-all duration-300 ${
          isViewerVisible ? (isHistoryOpen ? "flex-1" : "w-1/2") : (isHistoryOpen ? "flex-1" : "w-full")
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)] bg-[var(--color-bg)] shadow-[var(--shadow-sm)]">
          <div className="flex items-center gap-3">
            {/* Hamburger menu button for history */}
            <button
              onClick={() => {
                if (isTogglingHistory) return;
                setIsTogglingHistory(true);
                setIsHistoryOpen(!isHistoryOpen);
                setTimeout(() => setIsTogglingHistory(false), 300);
              }}
              disabled={isTogglingHistory}
              className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors disabled:opacity-50"
              title="Chat History"
            >
              <svg className="w-6 h-6 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)] flex items-center justify-center shadow-[var(--shadow-elegant)]">
              <span className="text-[var(--color-text-inverse)] font-bold text-sm">F</span>
            </div>
            <h1 className="text-xl font-bold text-[var(--color-text)]">
              FinDeep
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <CompactThemeToggle />
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-accent)] transition-all duration-300 shadow-[var(--shadow-sm)]"
              title="Settings"
            >
              <svg className="w-5 h-5 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button
              onClick={() => setIsViewerVisible(!isViewerVisible)}
              className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-accent)] transition-all duration-300 shadow-[var(--shadow-sm)]"
              title={isViewerVisible ? "Hide viewer" : "Show viewer"}
            >
              <svg
                className={`w-5 h-5 text-[var(--color-text-secondary)] transition-transform duration-300 ${isViewerVisible ? "rotate-180" : ""}`}
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
              <button className="flex items-center gap-2 p-2 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] transition-all duration-300 shadow-[var(--shadow-sm)]">
                <div className="w-8 h-8 rounded-full bg-[var(--color-accent)] flex items-center justify-center">
                  <span className="text-[var(--color-text-inverse)] font-medium text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-[var(--color-text)] text-sm font-medium hidden sm:block">
                  {user.name}
                </span>
                <svg className="w-4 h-4 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-[var(--shadow-elegant)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-2">
                  <div className="px-3 py-2 text-sm text-[var(--color-text)] border-b border-[var(--color-border)]">
                    {user.email}
                    {!isAuthenticated && (
                      <span className="ml-2 text-xs bg-[var(--color-bg-secondary)] text-[var(--color-text)] px-2 py-0.5 rounded-full border border-[var(--color-border)]">
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
                            className="w-full text-left px-3 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] rounded-lg transition-colors flex items-center gap-2"
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
                            className="w-full text-left px-3 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] rounded-lg transition-colors flex items-center gap-2"
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
                            className="w-full text-left px-3 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] rounded-lg transition-colors flex items-center gap-2"
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
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--color-bg)]">
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
          <div className="px-6 py-3 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-[var(--color-text-secondary)]">Pending files:</span>
              <button
                onClick={() => setPendingAttachments([])}
                className="text-xs text-[var(--color-text)] hover:text-[var(--color-text-secondary)] transition-colors"
              >
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {pendingAttachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center gap-2 px-3 py-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-xs"
                >
                  <span>{getAttachmentIcon(attachment.kind)}</span>
                  <span className="text-[var(--color-text)] truncate max-w-32">{attachment.title}</span>
                  <button
                    onClick={() => setPendingAttachments(prev => prev.filter(a => a.id !== attachment.id))}
                    className="text-[var(--color-text)] hover:text-[var(--color-text-secondary)] transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-6 border-t border-[var(--color-border)] bg-[var(--color-bg)]">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <div className="flex-1 relative flex items-center">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything about your financial data..."
                className="flex-1 px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 transition-all duration-300 text-[var(--color-text)] placeholder-[var(--color-text-muted)]"
                disabled={isLoading}
              />
              <div className="relative">
                <FileUpload ref={fileUploadRef} onFileUpload={handleFileUpload} disabled={isLoading} />
              </div>
            </div>
            <button
              type="submit"
              disabled={(!inputValue.trim() && pendingAttachments.length === 0) || isLoading}
              className="px-6 py-3 bg-[var(--color-accent)] text-[var(--color-text-inverse)] rounded-xl hover:bg-[var(--color-accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium flex items-center gap-2 shadow-[var(--shadow-lg)]"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[var(--color-text-inverse)]/30 border-t-[var(--color-text-inverse)] rounded-full animate-spin" />
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
        <div className="w-1/2 border-l border-[var(--color-border)]">
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
