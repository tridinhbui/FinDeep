export type Attachment =
  | {
      id: string;
      title: string;
      kind: "pdf" | "csv";
      mime: string;
      url: string;
      preview?: string;
    }
  | {
      id: string;
      title: string;
      kind: "markdown" | "text" | "html";
      mime: string;
      content: string;
      preview?: string;
    }
  | {
      id: string;
      title: string;
      kind: "table";
      mime: string;
      data: { columns: string[]; rows: (string | number)[][] };
      preview?: string;
    };

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string; // assistant narrative / analysis
  attachments?: Attachment[]; // optional
};

export type OpenDocument = {
  id: string;
  attachment: Attachment;
  tabId: string;
};

export type ViewerState = {
  openDocs: OpenDocument[];
  activeTabId: string | null;
};

