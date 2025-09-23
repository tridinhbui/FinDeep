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
  loadViewerState,
  generateTabId,
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

// Demo data - in production this would come from your API
const DEMO_MESSAGES: ChatMessage[] = [
  {
    id: "1",
    role: "user",
    content:
      "Can you analyze our Q3 financial performance and show me the key documents?",
  },
  {
    id: "2",
    role: "assistant",
    content:
      "I've analyzed your Q3 financial performance. Here are the key findings and supporting documents:\n\n**Key Highlights:**\n- Revenue increased 12% quarter-over-quarter\n- Operating margin improved to 18.5%\n- Cash flow remained strong at $2.3M\n\nI've attached the detailed financial report, KPI dashboard, and variance analysis memo for your review.",
    attachments: [
      {
        id: "att-1",
        title: "Q3 Financial Report",
        kind: "pdf",
        mime: "application/pdf",
        url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        preview:
          "Complete quarterly financial report with P&L, balance sheet, and cash flow statements",
      },
      {
        id: "att-2",
        title: "KPI Dashboard",
        kind: "table",
        mime: "application/json",
        data: {
          columns: ["Metric", "Q2 2023", "Q3 2023", "Change", "Target"],
          rows: [
            ["Revenue", "$12.5M", "$14.0M", "+12%", "$13.5M"],
            ["Gross Margin", "65%", "67%", "+2pp", "66%"],
            ["Operating Margin", "16%", "18.5%", "+2.5pp", "18%"],
            ["EBITDA", "$2.1M", "$2.6M", "+24%", "$2.4M"],
            ["Cash Flow", "$1.8M", "$2.3M", "+28%", "$2.0M"],
            ["Customer Acquisition Cost", "$150", "$135", "-10%", "$140"],
            ["Lifetime Value", "$2,400", "$2,650", "+10%", "$2,500"],
          ],
        },
        preview:
          "Key performance indicators for Q3 with targets and variance analysis",
      },
      {
        id: "att-3",
        title: "Variance Analysis Memo",
        kind: "markdown",
        mime: "text/markdown",
        content: `# Q3 2023 Variance Analysis

## Executive Summary
Q3 performance exceeded expectations across all major financial metrics. The 12% revenue growth was driven primarily by increased customer acquisition and improved retention rates.

## Revenue Analysis
- **Actual**: $14.0M vs **Target**: $13.5M (+3.7% variance)
- **Drivers**: 
  - New customer acquisition: +15% vs Q2
  - Average revenue per user: +8% due to premium tier adoption
  - Churn rate: Improved to 3.2% (target: 4.0%)

## Cost Management
- **Operating expenses**: $11.4M vs budget $11.8M
- **Key savings**:
  - Marketing efficiency: CAC reduced by 10%
  - Infrastructure optimization: Cloud costs down 8%
  - Process automation: Admin costs reduced 12%

## Risk Factors
- Supply chain costs increased 5% due to inflation
- Competitive pressure in core markets
- Regulatory changes in EU market

## Recommendations
1. Continue premium tier expansion strategy
2. Invest in customer success to maintain low churn
3. Monitor supply chain costs closely
4. Prepare for potential regulatory changes

*Analysis prepared by Finance Team - October 2023*`,
        preview:
          "Detailed variance analysis explaining Q3 performance vs targets and budget",
      },
    ],
  },
  {
    id: "3",
    role: "user",
    content: "Show me more financial documents and reports",
  },
  {
    id: "4",
    role: "assistant",
    content:
      "Here are additional financial documents and reports for your review:\n\n**Available Documents:**\n- Annual Budget Planning Guide\n- Cash Flow Forecast Model\n- Investment Analysis Report\n- Compliance Audit Results\n- Market Research Summary\n\nClick on any document below to view it in detail.",
    attachments: [
      {
        id: "att-4",
        title: "Annual Budget Planning Guide",
        kind: "pdf",
        mime: "application/pdf",
        url: "https://www.africau.edu/images/default/sample.pdf",
        preview:
          "Comprehensive guide for annual budget planning and forecasting processes",
      },
      {
        id: "att-5",
        title: "Cash Flow Forecast Model",
        kind: "pdf",
        mime: "application/pdf",
        url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        preview: "12-month cash flow projection model with scenario analysis",
      },
      {
        id: "att-6",
        title: "Investment Analysis Report",
        kind: "pdf",
        mime: "application/pdf",
        url: "https://www.africau.edu/images/default/sample.pdf",
        preview:
          "Detailed analysis of potential investment opportunities and ROI projections",
      },
      {
        id: "att-7",
        title: "Compliance Audit Results",
        kind: "table",
        mime: "application/json",
        data: {
          columns: ["Area", "Status", "Score", "Issues", "Action Required"],
          rows: [
            ["Financial Controls", "Compliant", "95%", "0", "None"],
            ["Data Security", "Compliant", "92%", "1", "Update encryption"],
            ["Regulatory Reporting", "Compliant", "98%", "0", "None"],
            ["Risk Management", "Minor Issues", "87%", "2", "Review policies"],
            ["Internal Audit", "Compliant", "94%", "0", "None"],
            ["Documentation", "Minor Issues", "89%", "1", "Update procedures"],
          ],
        },
        preview: "Compliance audit results across all business areas",
      },
      {
        id: "att-8",
        title: "Market Research Summary",
        kind: "markdown",
        mime: "text/markdown",
        content: `# Market Research Summary - Q3 2023

## Market Overview
The financial services market continues to show strong growth with increasing demand for digital solutions and AI-powered analytics.

## Key Findings

### Market Size & Growth
- **Total Addressable Market**: $2.8T (up 8% YoY)
- **Serviceable Market**: $450B (up 12% YoY)
- **Growth Rate**: 15% CAGR projected through 2026

### Competitive Landscape
- **Market Leaders**: Traditional banks (45% share)
- **Fintech Disruption**: 23% market share (up from 18% last year)
- **Emerging Players**: AI-first companies gaining traction

### Customer Trends
- **Digital Adoption**: 78% prefer digital channels
- **AI Expectations**: 65% expect AI-powered insights
- **Security Concerns**: 89% prioritize data protection

## Opportunities
1. **AI-Powered Analytics**: High demand for predictive insights
2. **Mobile-First Solutions**: Growing mobile user base
3. **Regulatory Technology**: Compliance automation needs
4. **Sustainable Finance**: ESG investment growth

## Recommendations
- Invest in AI/ML capabilities
- Enhance mobile experience
- Develop compliance automation tools
- Explore sustainable finance products

*Research conducted by Market Intelligence Team - October 2023*`,
        preview: "Comprehensive market research and competitive analysis",
      },
      {
        id: "att-9",
        title: "Financial Dashboard Data",
        kind: "csv",
        mime: "text/csv",
        url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        preview:
          "Raw financial data export for dashboard analysis and reporting",
      },
    ],
  },
];

interface ChatWithPreviewProps {
  user: { email: string; name: string };
  onLogout: () => void;
}

export const ChatWithPreview: React.FC<ChatWithPreviewProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>(DEMO_MESSAGES);
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
    const savedState = loadViewerState();
    if (savedState) {
      setViewerState(savedState);
      setIsViewerVisible(savedState.openDocs.length > 0);
    }
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
                    {user.email === 'demo@findeep.com' && (
                      <span className="ml-2 text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">
                        Demo
                      </span>
                    )}
                  </div>
                  {user.email === 'demo@findeep.com' ? (
                    <button
                      onClick={() => navigate('/login')}
                      className="w-full text-left px-3 py-2 text-sm text-dark-text hover:bg-dark-surface-hover rounded-lg transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Login to Account
                    </button>
                  ) : (
                    <button
                      onClick={onLogout}
                      className="w-full text-left px-3 py-2 text-sm text-dark-text hover:bg-dark-surface-hover rounded-lg transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
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
                placeholder="Ask about your financial data..."
                className="flex-1 px-4 py-3 bg-dark-surface border border-dark-border rounded-xl focus:outline-none focus:border-accent focus:shadow-glow transition-all duration-300 text-dark-text placeholder-dark-text-muted"
                disabled={isLoading}
              />
              <FileUpload onFileUpload={handleFileUpload} disabled={isLoading} />
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
