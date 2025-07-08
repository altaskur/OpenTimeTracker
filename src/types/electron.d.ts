// Type declarations for Electron API

export interface Example {
  id: number;
  message: string;
  created_at: string;
}

declare global {
  interface Window {
    electronAPI: {
      ping: () => Promise<string>;
      addExample: (message: string) => Promise<any>;
      getExamples: () => Promise<Example[]>;
    };
  }
}

export {};
