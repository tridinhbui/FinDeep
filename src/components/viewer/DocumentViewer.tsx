import React from "react";
import { Attachment, OpenDocument } from "../../types/chat";

interface DocumentViewerProps {
  openDocs: OpenDocument[];
  activeTabId: string | null;
  onCloseTab: (tabId: string) => void;
  onActivate: (tabId: string) => void;
}

interface DocumentRendererProps {
  attachment: Attachment;
}

const PDFRenderer: React.FC<DocumentRendererProps> = ({ attachment }) => {
  if (attachment.kind !== "pdf") return null;

  return (
    <iframe
      src={attachment.url}
      className="w-full h-full border-0"
      title={attachment.title}
      sandbox="allow-same-origin allow-scripts allow-forms"
    />
  );
};

const CSVRenderer: React.FC<DocumentRendererProps> = ({ attachment }) => {
  if (attachment.kind !== "csv") return null;

  return (
    <iframe
      src={attachment.url}
      className="w-full h-full border-0"
      title={attachment.title}
      sandbox="allow-same-origin allow-scripts allow-forms"
    />
  );
};

const MarkdownRenderer: React.FC<DocumentRendererProps> = ({ attachment }) => {
  if (attachment.kind !== "markdown") return null;

  // Simple markdown to HTML conversion (basic implementation)
  const formatMarkdown = (text: string): string => {
    return text
      .replace(/^### (.*$)/gim, "<h3>$1</h3>")
      .replace(/^## (.*$)/gim, "<h2>$1</h2>")
      .replace(/^# (.*$)/gim, "<h1>$1</h1>")
      .replace(/\*\*(.*)\*\*/gim, "<strong>$1</strong>")
      .replace(/\*(.*)\*/gim, "<em>$1</em>")
      .replace(/\n\n/gim, "</p><p>")
      .replace(/\n/gim, "<br>")
      .replace(/^(.*)$/gim, "<p>$1</p>");
  };

  return (
    <div
      className="prose prose-invert max-w-none p-4 h-full overflow-auto"
      dangerouslySetInnerHTML={{ __html: formatMarkdown(attachment.content) }}
    />
  );
};

const TextRenderer: React.FC<DocumentRendererProps> = ({ attachment }) => {
  if (attachment.kind !== "text") return null;

  return (
    <pre className="whitespace-pre-wrap p-4 h-full overflow-auto text-sm font-mono bg-dark-surface">
      {attachment.content}
    </pre>
  );
};

const HTMLRenderer: React.FC<DocumentRendererProps> = ({ attachment }) => {
  if (attachment.kind !== "html") return null;

  // TODO: Sanitize HTML content in production
  return (
    <div
      className="p-4 h-full overflow-auto"
      dangerouslySetInnerHTML={{ __html: attachment.content }}
    />
  );
};

const TableRenderer: React.FC<DocumentRendererProps> = ({ attachment }) => {
  if (attachment.kind !== "table") return null;

  const { columns, rows } = attachment.data;

  return (
    <div className="h-full overflow-auto">
      <table className="w-full border-collapse border border-dark-border">
        <thead className="bg-dark-surface sticky top-0">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className="border border-dark-border px-4 py-2 text-left font-semibold text-dark-text"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-dark-surface/50">
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="border border-dark-border px-4 py-2 text-dark-text-secondary"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const DocumentContent: React.FC<DocumentRendererProps> = ({ attachment }) => {
  switch (attachment.kind) {
    case "pdf":
      return <PDFRenderer attachment={attachment} />;
    case "csv":
      return <CSVRenderer attachment={attachment} />;
    case "markdown":
      return <MarkdownRenderer attachment={attachment} />;
    case "text":
      return <TextRenderer attachment={attachment} />;
    case "html":
      return <HTMLRenderer attachment={attachment} />;
    case "table":
      return <TableRenderer attachment={attachment} />;
    default:
      return (
        <div className="flex items-center justify-center h-full text-dark-text-secondary">
          Unsupported document type
        </div>
      );
  }
};

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

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  openDocs,
  activeTabId,
  onCloseTab,
  onActivate,
}) => {
  const activeDoc = openDocs.find((doc) => doc.tabId === activeTabId);

  if (openDocs.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-dark-bg to-dark-surface border-l border-dark-border">
        <div className="text-center text-dark-text-secondary animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-accent/20 to-accent-light/20 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-accent"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-3 text-dark-text">
            No documents open
          </h3>
          <p className="text-sm text-dark-text-muted max-w-sm">
            Click on any attachment in the chat to view it here. You can open
            multiple documents and switch between them using tabs.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-dark-bg to-dark-surface border-l border-dark-border">
      {/* Tab Bar */}
      <div className="flex border-b border-dark-border bg-card-gradient backdrop-blur-sm">
        {openDocs.map((doc) => (
          <div
            key={doc.tabId}
            className={`
              group flex items-center gap-3 px-4 py-3 border-r border-dark-border cursor-pointer
              transition-all duration-300 min-w-0 flex-1 max-w-xs
              ${
                activeTabId === doc.tabId
                  ? "bg-gradient-to-r from-accent/10 to-accent-light/10 text-dark-text border-b-2 border-accent shadow-glow"
                  : "text-dark-text-secondary hover:text-dark-text hover:bg-dark-surface-hover/50"
              }
            `}
            onClick={() => onActivate(doc.tabId)}
          >
            <div className="flex-shrink-0 w-6 h-6 rounded-md bg-gradient-to-br from-accent/20 to-accent-light/20 flex items-center justify-center">
              <span className="text-xs">
                {getAttachmentIcon(doc.attachment.kind)}
              </span>
            </div>
            <span
              className="text-sm font-medium truncate"
              title={doc.attachment.title}
            >
              {doc.attachment.title}
            </span>
            <button
              className="ml-auto w-5 h-5 rounded-full hover:bg-red-500/20 flex items-center justify-center text-xs hover:text-red-400 transition-all duration-200 opacity-0 group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                onCloseTab(doc.tabId);
              }}
              aria-label={`Close ${doc.attachment.title}`}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Document Content */}
      <div className="flex-1 overflow-hidden">
        {activeDoc ? (
          <DocumentContent attachment={activeDoc.attachment} />
        ) : (
          <div className="flex items-center justify-center h-full text-dark-text-secondary">
            Select a document to view
          </div>
        )}
      </div>
    </div>
  );
};
