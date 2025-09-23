import { ChatMessage, Attachment } from '../types/chat';

// Configuration
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY || '';
const OPENAI_API_URL = process.env.REACT_APP_OPENAI_API_URL || 'https://api.openai.com/v1';
const CLAUDE_API_KEY = process.env.REACT_APP_CLAUDE_API_KEY || '';
const CLAUDE_API_URL = process.env.REACT_APP_CLAUDE_API_URL || 'https://api.anthropic.com/v1';
const AI_PROVIDER = process.env.REACT_APP_AI_PROVIDER || 'claude'; // 'openai' or 'claude'
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
}

class ApiService {
  private openaiApiKey: string;
  private openaiApiUrl: string;
  private claudeApiKey: string;
  private claudeApiUrl: string;
  private aiProvider: string;

  constructor() {
    this.openaiApiKey = OPENAI_API_KEY;
    this.openaiApiUrl = OPENAI_API_URL;
    this.claudeApiKey = CLAUDE_API_KEY;
    this.claudeApiUrl = CLAUDE_API_URL;
    this.aiProvider = AI_PROVIDER;
  }

  async sendMessage(request: ApiRequest): Promise<ApiResponse> {
    // Check if we have a valid API key for the selected provider
    const hasValidKey = this.hasValidApiKey(request.userEmail);
    
    if (DEBUG_MODE) {
      console.log(`🔍 API Debug Info:`);
      console.log(`- AI Provider: ${this.aiProvider}`);
      console.log(`- User Email: ${request.userEmail || 'none'}`);
      console.log(`- Has Valid Key: ${hasValidKey}`);
      console.log(`- OpenAI Key: ${this.openaiApiKey ? 'Set' : 'Not set'}`);
      console.log(`- Claude Key: ${this.claudeApiKey ? 'Set' : 'Not set'}`);
    }
    
    if (!hasValidKey) {
      if (DEBUG_MODE) {
        console.log(`❌ No valid API key configured for ${this.aiProvider}, using demo mode`);
      }
      return this.getDemoResponse(request.message, request.attachments);
    }
    
    if (DEBUG_MODE) {
      console.log(`✅ Using real AI API: ${this.aiProvider.toUpperCase()}`);
    }

    try {
      if (this.aiProvider === 'claude') {
        return await this.sendClaudeMessage(request);
      } else {
        return await this.sendOpenAIMessage(request);
      }
    } catch (error) {
      console.error(`${this.aiProvider.toUpperCase()} API Error:`, error);
      
      // Fallback to demo response for development
      return this.getDemoResponse(request.message, request.attachments);
    }
  }

  private hasValidApiKey(userEmail?: string): boolean {
    if (userEmail) {
      // Check for user-specific API keys first
      const userClaudeKey = localStorage.getItem(`findeep-claude-key-${userEmail}`);
      const userOpenaiKey = localStorage.getItem(`findeep-openai-key-${userEmail}`);
      
      if (this.aiProvider === 'claude') {
        // If user has a specific key, use it; otherwise fall back to global
        if (userClaudeKey && userClaudeKey.trim()) {
          return true;
        }
        return !!(this.claudeApiKey && this.claudeApiKey !== 'your-claude-api-key-here');
      } else {
        // If user has a specific key, use it; otherwise fall back to global
        if (userOpenaiKey && userOpenaiKey.trim()) {
          return true;
        }
        return !!(this.openaiApiKey && this.openaiApiKey !== 'your-openai-api-key-here');
      }
    } else {
      // Fallback to global keys
      if (this.aiProvider === 'claude') {
        return !!(this.claudeApiKey && this.claudeApiKey !== 'your-claude-api-key-here');
      } else {
        return !!(this.openaiApiKey && this.openaiApiKey !== 'your-openai-api-key-here');
      }
    }
  }

  // Convert our chat format to Claude format
  private convertToClaudeFormat(request: ApiRequest): string {
    const systemPrompt = `You are FinDeep, an AI financial analyst assistant. You help users analyze financial data, create reports, and provide insights. 

You can:
- Analyze financial documents and data
- Create financial reports and summaries
- Provide investment insights and recommendations
- Help with budgeting and forecasting
- Explain financial concepts and terms

When users upload files, you can reference them in your analysis. Always provide clear, actionable financial insights.`;

    let prompt = `${systemPrompt}\n\n`;

    // Add conversation history
    if (request.conversation_history) {
      request.conversation_history.forEach(msg => {
        prompt += `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}\n\n`;
      });
    }

    // Add current message with context about attachments
    let currentMessage = request.message;
    if (request.attachments && request.attachments.length > 0) {
      const attachmentInfo = request.attachments.map(att => 
        `- ${att.title} (${att.kind}): ${att.preview || 'No preview available'}`
      ).join('\n');
      
      currentMessage += `\n\nUser has uploaded the following files:\n${attachmentInfo}`;
    }

    prompt += `Human: ${currentMessage}\n\nAssistant:`;

    return prompt;
  }

  private async sendClaudeMessage(request: ApiRequest): Promise<ApiResponse> {
    const prompt = this.convertToClaudeFormat(request);
    
    // Get user-specific API key or fallback to global
    let apiKey = this.claudeApiKey;
    if (request.userEmail) {
      const userKey = localStorage.getItem(`findeep-claude-key-${request.userEmail}`);
      if (userKey) apiKey = userKey;
    }
    
    const response = await fetch(`${this.claudeApiUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Claude API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const aiMessage = data.content[0]?.text || 'Sorry, I could not generate a response.';
    
    return {
      message: aiMessage,
      attachments: this.generateAttachmentsFromResponse(aiMessage, request.attachments)
    };
  }

  private async sendOpenAIMessage(request: ApiRequest): Promise<ApiResponse> {
    const messages = this.convertToOpenAIFormat(request);
    
    // Get user-specific API key or fallback to global
    let apiKey = this.openaiApiKey;
    if (request.userEmail) {
      const userKey = localStorage.getItem(`findeep-openai-key-${request.userEmail}`);
      if (userKey) apiKey = userKey;
    }
    
    const response = await fetch(`${this.openaiApiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const aiMessage = data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    
    return {
      message: aiMessage,
      attachments: this.generateAttachmentsFromResponse(aiMessage, request.attachments)
    };
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

  // Convert our chat format to OpenAI format
  private convertToOpenAIFormat(request: ApiRequest): any[] {
    const systemPrompt = `You are FinDeep, an AI financial analyst assistant. You help users analyze financial data, create reports, and provide insights. 

You can:
- Analyze financial documents and data
- Create financial reports and summaries
- Provide investment insights and recommendations
- Help with budgeting and forecasting
- Explain financial concepts and terms

When users upload files, you can reference them in your analysis. Always provide clear, actionable financial insights.`;

    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    // Add conversation history
    if (request.conversation_history) {
      request.conversation_history.forEach(msg => {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      });
    }

    // Add current message with context about attachments
    let currentMessage = request.message;
    if (request.attachments && request.attachments.length > 0) {
      const attachmentInfo = request.attachments.map(att => 
        `- ${att.title} (${att.kind}): ${att.preview || 'No preview available'}`
      ).join('\n');
      
      currentMessage += `\n\nUser has uploaded the following files:\n${attachmentInfo}`;
    }

    messages.push({
      role: 'user',
      content: currentMessage
    });

    return messages;
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

  // Demo responses for development/testing
  private getDemoResponse(message: string, attachments?: Attachment[]): ApiResponse {
    const lowerMessage = message.toLowerCase();
    
    // Check for financial analysis requests
    if (lowerMessage.includes('analyze') || lowerMessage.includes('financial') || lowerMessage.includes('report')) {
      return {
        message: `I've analyzed your request: "${message}". Here's what I found:\n\n**Key Insights:**\n- Revenue trends show positive growth\n- Operating margins are within target range\n- Cash flow remains stable\n\nI've prepared some supporting documents for your review.`,
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
        message: `Based on your budget planning request, I've prepared a comprehensive analysis:\n\n**Budget Recommendations:**\n- Allocate 40% to operational expenses\n- Reserve 25% for growth initiatives\n- Maintain 15% emergency fund\n- Invest 20% in technology upgrades\n\nHere are the detailed planning documents:`,
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
        message: `I've analyzed your investment opportunities:\n\n**Investment Analysis:**\n- Technology upgrade: 18% ROI projected\n- Market expansion: 22% ROI projected\n- Process automation: 15% ROI projected\n\nHere's the detailed investment analysis:`,
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
      message: `Thank you for your message: "${message}". I'm here to help with your financial analysis and planning needs. I can assist with:\n\n• Financial report analysis\n• Budget planning and forecasting\n• Investment opportunity evaluation\n• Risk assessment\n• Compliance monitoring\n\nPlease let me know what specific financial task you'd like help with!`,
      attachments: attachments ? [
        {
          id: `demo-${Date.now()}-6`,
          title: 'Your Uploaded Files',
          kind: 'text',
          mime: 'text/plain',
          content: `You've uploaded ${attachments.length} file(s):\n\n${attachments.map(att => `• ${att.title} (${att.kind})`).join('\n')}\n\nI can analyze these documents and provide insights based on their content.`,
          preview: 'Summary of your uploaded files'
        }
      ] : []
    };
  }
}

export const apiService = new ApiService();

