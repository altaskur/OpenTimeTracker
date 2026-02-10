import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { ipcMain, shell } from 'electron';
import { setupSystemHandlers } from './system-handlers.js';

vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn(),
  },
  shell: {
    openExternal: vi.fn(),
  },
}));

describe('System Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should setup open-external handler', () => {
    setupSystemHandlers();
    expect(ipcMain.handle).toHaveBeenCalledWith(
      'open-external',
      expect.any(Function),
    );
  });

  it('should handle open-external call', async () => {
    setupSystemHandlers();
    const handler = (ipcMain.handle as Mock).mock.calls.find(
      (call) => call[0] === 'open-external',
    )?.[1];

    const url = 'https://example.com';
    await handler(null, url);

    expect(shell.openExternal).toHaveBeenCalledWith(url);
  });

  it('should handle errors in open-external', async () => {
    setupSystemHandlers();
    const handler = (ipcMain.handle as Mock).mock.calls.find(
      (call) => call[0] === 'open-external',
    )?.[1];

    const error = new Error('Failed to open');
    (shell.openExternal as Mock).mockRejectedValue(error);

    await expect(handler(null, 'https://example.com')).rejects.toThrow(error);
  });
});
