import { ViewerState } from "../../types/chat";

const STORAGE_KEY = "findeep-viewer-state";

export const saveViewerState = (state: ViewerState): void => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Failed to save viewer state:", error);
  }
};

export const loadViewerState = (): ViewerState | null => {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);

    // Validate the structure
    if (
      typeof parsed === "object" &&
      Array.isArray(parsed.openDocs) &&
      (parsed.activeTabId === null || typeof parsed.activeTabId === "string")
    ) {
      return parsed as ViewerState;
    }

    return null;
  } catch (error) {
    console.warn("Failed to load viewer state:", error);
    return null;
  }
};

export const clearViewerState = (): void => {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("Failed to clear viewer state:", error);
  }
};

export const generateTabId = (): string => {
  return `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
