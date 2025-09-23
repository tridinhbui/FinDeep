import React, { useRef, useState } from 'react';
import { Attachment } from '../../types/chat';

interface FileUploadProps {
  onFileUpload: (attachments: Attachment[]) => void;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, disabled = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const attachments: Attachment[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const attachment = await processFile(file);
        if (attachment) {
          attachments.push(attachment);
        }
      }

      if (attachments.length > 0) {
        onFileUpload(attachments);
      }
    } catch (error) {
      console.error('Error processing files:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const processFile = async (file: File): Promise<Attachment | null> => {
    const fileType = file.type;
    const fileName = file.name;
    const fileId = `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create a preview URL for the file
    const previewUrl = URL.createObjectURL(file);

    // Determine attachment kind based on file type
    if (fileType === 'application/pdf') {
      return {
        id: fileId,
        title: fileName,
        kind: 'pdf',
        mime: fileType,
        url: previewUrl,
        preview: `PDF document (${formatFileSize(file.size)})`
      };
    } else if (fileType === 'text/csv' || fileName.endsWith('.csv')) {
      return {
        id: fileId,
        title: fileName,
        kind: 'csv',
        mime: fileType,
        url: previewUrl,
        preview: `CSV file (${formatFileSize(file.size)})`
      };
    } else if (fileType === 'text/markdown' || fileName.endsWith('.md')) {
      const content = await readFileAsText(file);
      return {
        id: fileId,
        title: fileName,
        kind: 'markdown',
        mime: fileType,
        content,
        preview: `Markdown document (${formatFileSize(file.size)})`
      };
    } else if (fileType === 'text/html' || fileName.endsWith('.html')) {
      const content = await readFileAsText(file);
      return {
        id: fileId,
        title: fileName,
        kind: 'html',
        mime: fileType,
        content,
        preview: `HTML document (${formatFileSize(file.size)})`
      };
    } else if (fileType.startsWith('text/') || fileName.endsWith('.txt')) {
      const content = await readFileAsText(file);
      return {
        id: fileId,
        title: fileName,
        kind: 'text',
        mime: fileType,
        content,
        preview: `Text document (${formatFileSize(file.size)})`
      };
    } else if (fileType === 'application/json' || fileName.endsWith('.json')) {
      try {
        const content = await readFileAsText(file);
        const data = JSON.parse(content);
        
        // Check if it's a table-like structure
        if (data.columns && Array.isArray(data.columns) && data.rows && Array.isArray(data.rows)) {
          return {
            id: fileId,
            title: fileName,
            kind: 'table',
            mime: fileType,
            data: {
              columns: data.columns,
              rows: data.rows
            },
            preview: `Data table (${data.rows.length} rows, ${data.columns.length} columns)`
          };
        } else {
          return {
            id: fileId,
            title: fileName,
            kind: 'text',
            mime: fileType,
            content,
            preview: `JSON file (${formatFileSize(file.size)})`
          };
        }
      } catch {
        return {
          id: fileId,
          title: fileName,
          kind: 'text',
          mime: fileType,
          content: await readFileAsText(file),
          preview: `JSON file (${formatFileSize(file.size)})`
        };
      }
    }

    // Unsupported file type
    console.warn(`Unsupported file type: ${fileType}`);
    return null;
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string || '');
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.csv,.md,.html,.txt,.json"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />
      
      <button
        onClick={handleClick}
        disabled={disabled || isUploading}
        className={`
          relative p-2 rounded-lg transition-all duration-200 ml-2
          ${disabled || isUploading
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-dark-surface-hover cursor-pointer'
          }
        `}
        title="Upload files"
      >
        {isUploading ? (
          <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        ) : (
          <svg
            className="w-5 h-5 text-dark-text-secondary hover:text-accent transition-colors"
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
        )}
      </button>

      {/* Drag and Drop Overlay - Only show when actually dragging files */}
      {isDragOver && (
        <div
          className="absolute inset-0 bg-accent/10 backdrop-blur-sm z-50 flex items-center justify-center rounded-xl"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="bg-card-gradient border-2 border-dashed border-accent rounded-2xl p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-accent/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-dark-text mb-1">Drop files here</h3>
            <p className="text-dark-text-secondary text-xs">
              PDF, CSV, Markdown, HTML, Text, JSON
            </p>
          </div>
        </div>
      )}
    </>
  );
};

