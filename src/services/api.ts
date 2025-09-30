import { ChatMessage, Attachment } from '../types/chat';

// Configuration
const FINDDEEP_BACKEND_URL = process.env.REACT_APP_FINDDEEP_BACKEND_URL || 'http://localhost:8001';
const DEBUG_MODE = process.env.REACT_APP_DEBUG === 'true';

export interface ApiResponse {
  message: string;
  attachments?: Attachment[];
  error?: string;
}

export interface ApiRequest {
  message: string;
  attachments?: Attachment[];
  conversation_history?: ChatMessage[];
  userEmail?: string;
  session_id?: string;
}

class ApiService {
  private finddeepBackendUrl: string;

  constructor() {
    this.finddeepBackendUrl = FINDDEEP_BACKEND_URL;
  }

  // Generate a session ID for the user if not provided
  private generateSessionId(userEmail?: string): string {
    if (userEmail) {
      // Use email-based session for consistency
      return `session_${userEmail.replace('@', '_').replace('.', '_')}`;
    }
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async sendMessage(request: ApiRequest): Promise<ApiResponse> {
    const sessionId = request.session_id || this.generateSessionId(request.userEmail);
    
    // Get user-specific backend URL or fallback to default
    let backendUrl = this.finddeepBackendUrl;
    if (request.userEmail) {
      const userBackendUrl = localStorage.getItem(`findeep-backend-url-${request.userEmail}`);
      if (userBackendUrl) {
        backendUrl = userBackendUrl;
      }
    }
    
    if (DEBUG_MODE) {
      console.log(`🔍 FinDeep Backend Debug Info:`);
      console.log(`- Backend URL: ${backendUrl}`);
      console.log(`- Session ID: ${sessionId}`);
      console.log(`- User Email: ${request.userEmail || 'none'}`);
      console.log(`- Message: ${request.message}`);
    }

    try {
      // Prepare message with context about attachments
      let messageWithContext = request.message;
      if (request.attachments && request.attachments.length > 0) {
        const attachmentInfo = request.attachments.map(att => 
          `[File: ${att.title} (${att.kind}) - ${att.preview || 'No preview available'}]`
        ).join(' ');
        
        if (messageWithContext.trim()) {
          messageWithContext += ` ${attachmentInfo}`;
        } else {
          messageWithContext = `Files attached: ${attachmentInfo}`;
        }
      }

      const response = await fetch(`${backendUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          message: messageWithContext
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`FinDeep Backend error: ${response.status} - ${errorData.detail || 'Unknown error'}`);
      }

      const data = await response.json();
      
      if (DEBUG_MODE) {
        console.log(`✅ FinDeep Backend Response:`, data);
      }

      return {
        message: data.response,
        attachments: this.generateAttachmentsFromResponse(data.response, request.attachments)
      };

    } catch (error) {
      console.error('FinDeep Backend Error:', error);
      
      // Fallback to demo response if backend is not available
      if (DEBUG_MODE) {
        console.log(`❌ Backend unavailable, using demo mode`);
      }
      return this.getDemoResponse(request.message, request.attachments);
    }
  }


  async uploadFile(file: File): Promise<{ url: string; id: string }> {
    // For now, we'll use local file URLs since we're focusing on OpenAI integration
    // In a production setup, you might want to upload to a cloud storage service
    try {
      const url = URL.createObjectURL(file);
      const id = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      if (DEBUG_MODE) {
        console.log('File uploaded locally:', { name: file.name, size: file.size, type: file.type });
      }
      
      return { url, id };
    } catch (error) {
      console.error('Upload Error:', error);
      throw new Error('Failed to process file upload');
    }
  }


  // Generate relevant attachments based on AI response
  private generateAttachmentsFromResponse(aiMessage: string, userAttachments?: Attachment[]): Attachment[] {
    const attachments: Attachment[] = [];
    
    // If user uploaded files, create a summary attachment
    if (userAttachments && userAttachments.length > 0) {
      attachments.push({
        id: `summary-${Date.now()}`,
        title: 'Uploaded Files Summary',
        kind: 'text',
        mime: 'text/plain',
        content: `Files analyzed:\n\n${userAttachments.map(att => 
          `• ${att.title} (${att.kind})\n  ${att.preview || 'No preview available'}`
        ).join('\n\n')}`,
        preview: 'Summary of uploaded files and their analysis'
      });
    }

    // Check if the response mentions specific financial concepts and add relevant attachments
    const lowerMessage = aiMessage.toLowerCase();
    
    if (lowerMessage.includes('budget') || lowerMessage.includes('forecast')) {
      attachments.push({
        id: `budget-${Date.now()}`,
        title: 'Budget Planning Template',
        kind: 'markdown',
        mime: 'text/markdown',
        content: `# Budget Planning Template

## Monthly Budget Categories
- **Income**: $0
- **Housing**: $0 (30% of income)
- **Food**: $0 (10-15% of income)
- **Transportation**: $0 (10-15% of income)
- **Utilities**: $0 (5-10% of income)
- **Healthcare**: $0 (5-10% of income)
- **Savings**: $0 (20% of income)
- **Entertainment**: $0 (5-10% of income)
- **Other**: $0

## Tips
- Track all expenses
- Review monthly
- Adjust as needed
- Build emergency fund`,
        preview: 'Basic budget planning template'
      });
    }

    if (lowerMessage.includes('investment') || lowerMessage.includes('roi')) {
      attachments.push({
        id: `investment-${Date.now()}`,
        title: 'Investment Analysis Framework',
        kind: 'table',
        mime: 'application/json',
        data: {
          columns: ['Investment Type', 'Risk Level', 'Expected Return', 'Time Horizon'],
          rows: [
            ['Stocks', 'High', '7-10%', '5+ years'],
            ['Bonds', 'Low-Medium', '2-5%', '1-10 years'],
            ['Real Estate', 'Medium', '6-8%', '5+ years'],
            ['Savings Account', 'Very Low', '1-3%', 'Any'],
            ['CDs', 'Very Low', '2-4%', '1-5 years']
          ]
        },
        preview: 'Investment options comparison table'
      });
    }

    return attachments;
  }

  // Demo responses for development/testing (when FinDeep backend is not available)
  private getDemoResponse(message: string, attachments?: Attachment[]): ApiResponse {
    const lowerMessage = message.toLowerCase();
    
    // Check for financial analysis requests
    if (lowerMessage.includes('analyze') || lowerMessage.includes('financial') || lowerMessage.includes('report')) {
      return {
        message: `🔧 **Demo Mode** - FinDeep Backend not available\n\nI've analyzed your request: "${message}". Here's what I found:\n\n**Key Insights:**\n- Revenue trends show positive growth\n- Operating margins are within target range\n- Cash flow remains stable\n\n*Note: This is a demo response. Connect to the FinDeep backend for real financial analysis.*`,
        attachments: [
          {
            id: `demo-${Date.now()}-1`,
            title: 'Financial Analysis Report',
            kind: 'pdf',
            mime: 'application/pdf',
            url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            preview: 'Detailed financial analysis based on your data'
          },
          {
            id: `demo-${Date.now()}-2`,
            title: 'Key Metrics Dashboard',
            kind: 'table',
            mime: 'application/json',
            data: {
              columns: ['Metric', 'Current', 'Previous', 'Change'],
              rows: [
                ['Revenue', '$2.4M', '$2.1M', '+14.3%'],
                ['Profit Margin', '18.5%', '16.2%', '+2.3pp'],
                ['Cash Flow', '$450K', '$380K', '+18.4%'],
                ['Customer Growth', '1,250', '1,100', '+13.6%']
              ]
            },
            preview: 'Key performance metrics and trends'
          }
        ]
      };
    }

    // Check for budget/forecasting requests
    if (lowerMessage.includes('budget') || lowerMessage.includes('forecast') || lowerMessage.includes('planning')) {
      return {
        message: `🔧 **Demo Mode** - FinDeep Backend not available\n\nBased on your budget planning request, I've prepared a comprehensive analysis:\n\n**Budget Recommendations:**\n- Allocate 40% to operational expenses\n- Reserve 25% for growth initiatives\n- Maintain 15% emergency fund\n- Invest 20% in technology upgrades\n\n*Note: This is a demo response. Connect to the FinDeep backend for real financial analysis.*`,
        attachments: [
          {
            id: `demo-${Date.now()}-3`,
            title: 'Budget Planning Guide',
            kind: 'pdf',
            mime: 'application/pdf',
            url: 'https://www.africau.edu/images/default/sample.pdf',
            preview: 'Comprehensive budget planning and allocation guide'
          },
          {
            id: `demo-${Date.now()}-4`,
            title: 'Forecast Model',
            kind: 'markdown',
            mime: 'text/markdown',
            content: `# Budget Forecast Model

## Executive Summary
This forecast model provides a 12-month projection based on current trends and market conditions.

## Key Assumptions
- **Revenue Growth**: 12% YoY
- **Cost Inflation**: 3.5% annually
- **Market Conditions**: Stable with moderate growth

## Monthly Projections

| Month | Revenue | Expenses | Net Income |
|-------|---------|----------|------------|
| Jan   | $200K   | $150K    | $50K       |
| Feb   | $210K   | $155K    | $55K       |
| Mar   | $220K   | $160K    | $60K       |

## Risk Factors
- Economic uncertainty
- Competitive pressure
- Regulatory changes

*Generated by FinDeep AI - ${new Date().toLocaleDateString()}*`,
            preview: '12-month financial forecast with key assumptions'
          }
        ]
      };
    }

    // Check for investment analysis
    if (lowerMessage.includes('investment') || lowerMessage.includes('roi') || lowerMessage.includes('return')) {
      return {
        message: `🔧 **Demo Mode** - FinDeep Backend not available\n\nI've analyzed your investment opportunities:\n\n**Investment Analysis:**\n- Technology upgrade: 18% ROI projected\n- Market expansion: 22% ROI projected\n- Process automation: 15% ROI projected\n\n*Note: This is a demo response. Connect to the FinDeep backend for real financial analysis.*`,
        attachments: [
          {
            id: `demo-${Date.now()}-5`,
            title: 'Investment Analysis Report',
            kind: 'pdf',
            mime: 'application/pdf',
            url: 'https://www.africau.edu/images/default/sample.pdf',
            preview: 'Comprehensive investment opportunity analysis'
          }
        ]
      };
    }

    // Default response
    return {
      message: `🔧 **Demo Mode** - FinDeep Backend not available\n\nThank you for your message: "${message}". I'm here to help with your financial analysis and planning needs. I can assist with:\n\n• Financial report analysis\n• Budget planning and forecasting\n• Investment opportunity evaluation\n• Risk assessment\n• Compliance monitoring\n\n*Note: This is a demo response. Connect to the FinDeep backend for real financial analysis.*`,
      attachments: attachments ? [
        {
          id: `demo-${Date.now()}-6`,
          title: 'Available Files',
          kind: 'text',
          mime: 'text/plain',
          content: `Files available for analysis:\n\n${attachments.map(att => `• ${att.title} (${att.kind})`).join('\n')}\n\nI can analyze these documents and provide insights based on their content.`,
          preview: 'Summary of your uploaded files'
        }
      ] : []
    };
  }
}

export const apiService = new ApiService();

