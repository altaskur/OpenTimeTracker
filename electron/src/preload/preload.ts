import { contextBridge, ipcRenderer } from 'electron';

const electronAPI = {
  ping: (): Promise<string> => ipcRenderer.invoke('ping'),
  addExample: (message: string): Promise<any> => ipcRenderer.invoke('add-example', message),
  getExamples: (): Promise<any[]> => ipcRenderer.invoke('get-examples'),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
