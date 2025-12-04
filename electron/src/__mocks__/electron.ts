import { vi } from 'vitest';

/**
 * Mock for Electron module in ESM mode.
 */
export const app = {
  isPackaged: false,
  getPath: vi.fn().mockReturnValue('/mock/path'),
  getAppPath: vi.fn().mockReturnValue('/mock/app'),
  quit: vi.fn(),
  getName: vi.fn().mockReturnValue('OpenTimeTracker'),
  getVersion: vi.fn().mockReturnValue('1.0.0'),
  getLocale: vi.fn().mockReturnValue('es-ES'),
  on: vi.fn(),
  whenReady: vi.fn().mockResolvedValue(undefined),
};

export const ipcMain = {
  handle: vi.fn(),
  on: vi.fn(),
  removeHandler: vi.fn(),
  removeAllListeners: vi.fn(),
};

export const ipcRenderer = {
  invoke: vi.fn(),
  on: vi.fn(),
  send: vi.fn(),
  removeListener: vi.fn(),
  removeAllListeners: vi.fn(),
};

export const BrowserWindow = vi.fn().mockImplementation(() => ({
  loadURL: vi.fn(),
  loadFile: vi.fn(),
  on: vi.fn(),
  once: vi.fn(),
  show: vi.fn(),
  hide: vi.fn(),
  close: vi.fn(),
  destroy: vi.fn(),
  isDestroyed: vi.fn().mockReturnValue(false),
  webContents: {
    send: vi.fn(),
    on: vi.fn(),
    openDevTools: vi.fn(),
    executeJavaScript: vi.fn(),
    setWindowOpenHandler: vi.fn(),
  },
  setMenu: vi.fn(),
  setMenuBarVisibility: vi.fn(),
}));

Object.assign(BrowserWindow, {
  getAllWindows: vi.fn().mockReturnValue([]),
  getFocusedWindow: vi.fn().mockReturnValue(null),
  fromWebContents: vi.fn().mockReturnValue(null),
});

export const dialog = {
  showOpenDialog: vi.fn().mockResolvedValue({ canceled: true, filePaths: [] }),
  showSaveDialog: vi
    .fn()
    .mockResolvedValue({ canceled: true, filePath: undefined }),
  showMessageBox: vi.fn().mockResolvedValue({ response: 0 }),
  showErrorBox: vi.fn(),
};

export const nativeTheme = {
  themeSource: 'system' as 'system' | 'light' | 'dark',
  shouldUseDarkColors: false,
  on: vi.fn(),
  removeListener: vi.fn(),
};

export const shell = {
  openExternal: vi.fn().mockResolvedValue(undefined),
  openPath: vi.fn().mockResolvedValue(''),
  showItemInFolder: vi.fn(),
};

export const Menu = {
  buildFromTemplate: vi.fn().mockReturnValue({}),
  setApplicationMenu: vi.fn(),
};

export const contextBridge = {
  exposeInMainWorld: vi.fn(),
};

export default {
  app,
  ipcMain,
  ipcRenderer,
  BrowserWindow,
  dialog,
  nativeTheme,
  shell,
  Menu,
  contextBridge,
};
