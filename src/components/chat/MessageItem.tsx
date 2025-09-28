import React from "react";
import { ChatMessage, Attachment } from "../../types/chat";

interface MessageItemProps {
  message: ChatMessage;
  onOpenAttachment: (attachment: Attachment) => void;
}

const getAttachmentIcon = (kind: Attachment["kind"]): string => {
  switch (kind) {
    case "pdf":
      return "📄";
    case "csv":
      return "📊";
    case "markdown":
      return "📝";
    case "text":
      return "📄";
    case "html":
      return "🌐";
    case "table":
      return "📋";
    default:
      return "📎";
  }
};

const AttachmentChip: React.FC<{
  attachment: Attachment;
  onClick: () => void;
}> = ({ attachment, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="
        group flex items-center gap-3 px-4 py-3 
        bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl
        hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-accent)] hover:shadow-[var(--shadow-elegant)]
        transition-all duration-300 cursor-pointer theme-transition
        text-left min-w-0
        transform hover:scale-[1.02] hover:-translate-y-0.5
      "
      title={attachment.preview || attachment.title}
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[var(--color-accent)] flex items-center justify-center text-[var(--color-text-inverse)] text-sm shadow-lg">
        {getAttachmentIcon(attachment.kind)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-[var(--color-text)] truncate group-hover:text-[var(--color-text)] transition-colors theme-transition">
          {attachment.title}
        </div>
        <div className="text-xs text-[var(--color-text-muted)] mt-0.5 theme-transition">
          {attachment.kind.toUpperCase()} • Click to view
        </div>
      </div>
      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <svg
          className="w-4 h-4 text-[var(--color-accent)]"
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
      </div>
    </button>
  );
};

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  onOpenAttachment,
}) => {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-6 animate-slide-up`}
    >
      <div
        className={`
        max-w-3xl px-6 py-4 rounded-2xl shadow-[var(--shadow-md)]
        theme-transition
        ${
          isUser
            ? "bg-[var(--color-chat-user)] text-[var(--color-chat-user-text)] shadow-[var(--shadow-elegant)]"
            : "bg-[var(--color-chat-assistant)] border border-[var(--color-chat-assistant-border)] text-[var(--color-chat-assistant-text)]"
        }
      `}
      >
        {/* Message Content */}
        {message.content && (
          <div className="mb-3">
            {message.content.split("\n").map((line, index) => (
              <p key={index} className="mb-2 last:mb-0">
                {line}
              </p>
            ))}
          </div>
        )}

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className={`space-y-3 ${message.content ? 'mt-4 pt-4 border-t border-[var(--color-border)]/30 theme-transition' : ''}`}>
            <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] theme-transition">
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
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                />
              </svg>
              Attachments ({message.attachments.length})
            </div>
            <div className="grid gap-3">
              {message.attachments.map((attachment) => (
                <AttachmentChip
                  key={attachment.id}
                  attachment={attachment}
                  onClick={() => onOpenAttachment(attachment)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
