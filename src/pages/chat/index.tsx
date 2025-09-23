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
import { ApiKeySettings } from "../../components/settings/ApiKeySettings";
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

interface ChatWithPreviewProps {
  user: { email: string; name: string };
  onLogout: () => void;
  isAuthenticated?: boolean;
  realUser?: any;
}

export const ChatWithPreview: React.FC<ChatWithPreviewProps> = ({ user, onLogout, isAuthenticated = false, realUser }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewerState, setViewerState] = useState<ViewerState>({
    openDocs: [],
    activeTabId: null,
  });
  const [isViewerVisible, setIsViewerVisible] = useState(true);
  const [showApiSettings, setShowApiSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      content: inputValue.trim() || "I've uploaded some files for analysis.",
      attachments: pendingAttachments.length > 0 ? [...pendingAttachments] : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setPendingAttachments([]);
    setIsLoading(true);

    try {
      // Call the AI API
      const response = await apiService.sendMessage({
        message: userMessage.content,
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
    // Clear the viewer state from session storage
    clearViewerState();
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-dark-bg to-dark-surface text-dark-text">
      {/* Chat Panel */}
      <div
        className={`flex flex-col ${isViewerVisible ? "w-1/2" : "w-full"} transition-all duration-300`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-border bg-card-gradient backdrop-blur-sm shadow-modern">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-modern-gradient flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent">
              FinDeep
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleClearChat}
              className="p-3 rounded-xl bg-dark-surface border border-dark-border hover:bg-dark-surface-hover hover:border-accent/50 hover:shadow-glow transition-all duration-300"
              title="Clear Chat & Files"
            >
              <svg className="w-5 h-5 text-dark-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <button
              onClick={() => setShowApiSettings(true)}
              className="p-3 rounded-xl bg-dark-surface border border-dark-border hover:bg-dark-surface-hover hover:border-accent/50 hover:shadow-glow transition-all duration-300"
              title="API Settings"
            >
              <svg className="w-5 h-5 text-dark-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button
              onClick={() => setIsViewerVisible(!isViewerVisible)}
              className="p-3 rounded-xl bg-dark-surface border border-dark-border hover:bg-dark-surface-hover hover:border-accent/50 hover:shadow-glow transition-all duration-300"
              title={isViewerVisible ? "Hide viewer" : "Show viewer"}
            >
              <svg
                className={`w-5 h-5 text-dark-text-secondary transition-transform duration-300 ${isViewerVisible ? "rotate-180" : ""}`}
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
              <button className="flex items-center gap-2 p-2 rounded-xl bg-dark-surface border border-dark-border hover:bg-dark-surface-hover transition-all duration-300">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent-light flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-dark-text text-sm font-medium hidden sm:block">
                  {user.name}
                </span>
                <svg className="w-4 h-4 text-dark-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-card-gradient border border-dark-border rounded-xl shadow-modern-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-2">
                  <div className="px-3 py-2 text-sm text-dark-text-muted border-b border-dark-border">
                    {user.email}
                    {!isAuthenticated ? (
                      <span className="ml-2 text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">
                        Demo
                      </span>
                    ) : (
                      <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                        Authenticated
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
                      className="w-full text-left px-3 py-2 text-sm text-dark-text hover:bg-dark-surface-hover rounded-lg transition-colors flex items-center gap-2"
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
                        className="w-full text-left px-3 py-2 text-sm text-dark-text hover:bg-dark-surface-hover rounded-lg transition-colors flex items-center gap-2"
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
                        className="w-full text-left px-3 py-2 text-sm text-dark-text hover:bg-dark-surface-hover rounded-lg transition-colors flex items-center gap-2"
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
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
          <div className="px-6 py-3 border-t border-dark-border bg-dark-surface/50">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-dark-text-muted">Pending files:</span>
              <button
                onClick={() => setPendingAttachments([])}
                className="text-xs text-accent hover:text-accent-light transition-colors"
              >
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {pendingAttachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center gap-2 px-3 py-1 bg-accent/10 border border-accent/20 rounded-lg text-xs"
                >
                  <span>{getAttachmentIcon(attachment.kind)}</span>
                  <span className="text-dark-text truncate max-w-32">{attachment.title}</span>
                  <button
                    onClick={() => setPendingAttachments(prev => prev.filter(a => a.id !== attachment.id))}
                    className="text-accent hover:text-accent-light transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-6 border-t border-dark-border bg-card-gradient backdrop-blur-sm">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <div className="flex-1 relative flex items-center">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything about your financial data..."
                className="flex-1 px-4 py-3 bg-dark-surface border border-dark-border rounded-xl focus:outline-none focus:border-accent focus:shadow-glow transition-all duration-300 text-dark-text placeholder-dark-text-muted"
                disabled={isLoading}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => e.preventDefault()}
              />
              <div className="relative">
                <FileUpload onFileUpload={handleFileUpload} disabled={isLoading} />
              </div>
            </div>
            <button
              type="submit"
              disabled={(!inputValue.trim() && pendingAttachments.length === 0) || isLoading}
              className="px-6 py-3 bg-modern-gradient text-white rounded-xl hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium flex items-center gap-2"
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
        <div className="w-1/2 border-l border-dark-border">
          <DocumentViewer
            openDocs={viewerState.openDocs}
            activeTabId={viewerState.activeTabId}
            onCloseTab={closeTab}
            onActivate={activateTab}
          />
        </div>
      )}

      {/* API Settings Modal */}
      {showApiSettings && (
        <ApiKeySettings
          user={user}
          onApiKeyUpdate={(provider, apiKey) => {
            console.log(`${provider} API key updated for ${user.email}`);
            setShowApiSettings(false);
          }}
        />
      )}
    </div>
  );
};
