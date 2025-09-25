import React, { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { Attachment } from '../../types/chat';

/**
 * Props interface for FileUpload component
 */
interface FileUploadProps {
  onFileUpload: (attachments: Attachment[]) => void;
  disabled?: boolean;
}

/**
 * Ref interface to expose methods to parent component
 */
export interface FileUploadRef {
  handleFileSelect: (files: FileList) => void;
}

/**
 * FileUpload Component
 * 
 * A reusable file upload component that supports:
 * - Click to browse files
 * - Drag and drop functionality
 * - Multiple file types (PDF, CSV, Markdown, HTML, Text, JSON)
 * - File processing and validation
 * - Loading states and error handling
 * 
 * @param onFileUpload - Callback function when files are successfully processed
 * @param disabled - Whether the upload is disabled
 * @param ref - Ref to expose handleFileSelect method
 */
export const FileUpload = forwardRef<FileUploadRef, FileUploadProps>(
  ({ onFileUpload, disabled = false }, ref) => {
    // Refs and state management
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    /**
     * Main file processing function
     * Handles file selection from both click and drag-drop events
     * 
     * @param files - FileList from input or drag-drop event
     */
    const handleFileSelect = async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      setIsUploading(true);
      const attachments: Attachment[] = [];

      try {
        // Process each file individually
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const attachment = await processFile(file);
          if (attachment) {
            attachments.push(attachment);
          }
        }

        // Notify parent component with processed attachments
        if (attachments.length > 0) {
          onFileUpload(attachments);
        }
      } catch (error) {
        console.error('Error processing files:', error);
      } finally {
        setIsUploading(false);
      }
    };

    /**
     * Expose handleFileSelect method to parent component
     * This allows parent to trigger file processing programmatically
     */
    useImperativeHandle(ref, () => ({
      handleFileSelect
    }));

    /**
     * Process individual file and convert to Attachment object
     * 
     * @param file - File object to process
     * @returns Promise<Attachment | null> - Processed attachment or null if unsupported
     */
    const processFile = async (file: File): Promise<Attachment | null> => {
      const fileType = file.type;
      const fileName = file.name;
      const fileId = `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Create a preview URL for the file
      const previewUrl = URL.createObjectURL(file);

      // Process different file types
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

    /**
     * Read file content as text
     * 
     * @param file - File object to read
     * @returns Promise<string> - File content as text
     */
    const readFileAsText = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string || '');
        reader.onerror = reject;
        reader.readAsText(file);
      });
    };

    /**
     * Format file size in human-readable format
     * 
     * @param bytes - File size in bytes
     * @returns string - Formatted file size
     */
    const formatFileSize = (bytes: number): string => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    /**
     * Handle click on upload button
     * Opens file browser dialog
     * @param {React.MouseEvent} e - The click event (optional)
     */
    const handleClick = (e?: React.MouseEvent) => {
      // Prevent any default form submission behavior
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (!disabled && !isUploading) {
        fileInputRef.current?.click();
      }
    };

    return (
      <>
        {/* Hidden file input for file selection */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.csv,.md,.html,.txt,.json"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        
        {/* Upload button with loading state */}
        <button
          type="button"
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
            // Loading spinner
            <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
          ) : (
            // Paperclip icon
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
      </>
    );
  }
);

// Set display name for debugging
FileUpload.displayName = 'FileUpload';