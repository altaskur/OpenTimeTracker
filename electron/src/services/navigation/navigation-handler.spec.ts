import { NavigationHandler } from './navigation-handler';
import { BrowserWindow } from 'electron';

// Ensure we use Jest's expect for matchers like expect.any
import { expect as jestExpect } from '@jest/globals';

jest.mock('electron', () => ({
  BrowserWindow: jest.fn(),
}));

describe('NavigationHandler', () => {
  let mockWindow: any;
  let handler: NavigationHandler;

  beforeEach(() => {
    mockWindow = {
      webContents: {
        on: jest.fn(),
        loadURL: jest.fn(),
      },
      loadURL: jest.fn(),
    };
  });

  it('should be defined', () => {
    expect(NavigationHandler).toBeDefined();
  });

  it('should create NavigationHandler instance', () => {
    handler = new NavigationHandler(mockWindow);
    expect(handler).toBeDefined();
    expect(handler).toBeInstanceOf(NavigationHandler);
  });

  it('should have setupNavigationHandlers method', () => {
    handler = new NavigationHandler(mockWindow);
    expect(typeof handler.setupNavigationHandlers).toBe('function');
  });

  it('should have loadIndex method', () => {
    handler = new NavigationHandler(mockWindow);
    expect(typeof handler.loadIndex).toBe('function');
  });

  it('should have getIndexUrl method', () => {
    handler = new NavigationHandler(mockWindow);
    expect(typeof handler.getIndexUrl).toBe('function');
  });

  it('should return index URL', () => {
    handler = new NavigationHandler(mockWindow);
    const url = handler.getIndexUrl();
    expect(url).toContain('index.html');
    expect(url).toContain('file://');
  });

  it('should load index HTML', () => {
    handler = new NavigationHandler(mockWindow);
    handler.loadIndex();
    expect(mockWindow.loadURL).toHaveBeenCalled();
    const callArg = mockWindow.loadURL.mock.calls[0][0];
    expect(callArg).toContain('index.html');
  });

  it('should setup navigation handlers', () => {
    handler = new NavigationHandler(mockWindow);
    handler.setupNavigationHandlers();
    expect(mockWindow.webContents.on).toHaveBeenCalledWith(
      'will-navigate',
      jestExpect.any(Function),
    );
    expect(mockWindow.webContents.on).toHaveBeenCalledWith(
      'did-fail-load',
      jestExpect.any(Function),
    );
    expect(mockWindow.webContents.on).toHaveBeenCalledWith(
      'before-input-event',
      jestExpect.any(Function),
    );
  });

  it('should register will-navigate handler', () => {
    handler = new NavigationHandler(mockWindow);
    handler.setupNavigationHandlers();

    const calls = mockWindow.webContents.on.mock.calls;
    const willNavigateCall = calls.find(
      (call: any) => call[0] === 'will-navigate',
    );
    expect(willNavigateCall).toBeDefined();
  });

  it('should register did-fail-load handler', () => {
    handler = new NavigationHandler(mockWindow);
    handler.setupNavigationHandlers();

    const calls = mockWindow.webContents.on.mock.calls;
    const failLoadCall = calls.find((call: any) => call[0] === 'did-fail-load');
    expect(failLoadCall).toBeDefined();
  });

  it('should register before-input-event handler', () => {
    handler = new NavigationHandler(mockWindow);
    handler.setupNavigationHandlers();

    const calls = mockWindow.webContents.on.mock.calls;
    const inputCall = calls.find(
      (call: any) => call[0] === 'before-input-event',
    );
    expect(inputCall).toBeDefined();
  });

  it('should intercept navigation and redirect to index', () => {
    handler = new NavigationHandler(mockWindow);
    handler.setupNavigationHandlers();

    const willNavigateHandler = mockWindow.webContents.on.mock.calls.find(
      (call: any) => call[0] === 'will-navigate',
    )[1];

    const mockEvent = { preventDefault: jest.fn() };
    const fileUrl = 'file:///some/path/dashboard';

    willNavigateHandler(mockEvent, fileUrl);

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockWindow.loadURL).toHaveBeenCalled();
  });

  it('should not intercept navigation to index.html', () => {
    handler = new NavigationHandler(mockWindow);
    handler.setupNavigationHandlers();

    const willNavigateHandler = mockWindow.webContents.on.mock.calls.find(
      (call: any) => call[0] === 'will-navigate',
    )[1];

    const mockEvent = { preventDefault: jest.fn() };
    const indexUrl = 'file:///some/path/index.html';

    willNavigateHandler(mockEvent, indexUrl);

    expect(mockEvent.preventDefault).not.toHaveBeenCalled();
  });

  it('should handle failed load with error code -6', () => {
    handler = new NavigationHandler(mockWindow);
    handler.setupNavigationHandlers();

    const failLoadHandler = mockWindow.webContents.on.mock.calls.find(
      (call: any) => call[0] === 'did-fail-load',
    )[1];

    const mockEvent = {};
    const errorCode = -6;
    const fileUrl = 'file:///some/path';

    failLoadHandler(mockEvent, errorCode, 'ERR_FILE_NOT_FOUND', fileUrl);

    expect(mockWindow.loadURL).toHaveBeenCalled();
  });

  it('should intercept F5 reload', () => {
    handler = new NavigationHandler(mockWindow);
    handler.setupNavigationHandlers();

    const inputHandler = mockWindow.webContents.on.mock.calls.find(
      (call: any) => call[0] === 'before-input-event',
    )[1];

    const mockEvent = { preventDefault: jest.fn() };
    const input = { type: 'keyDown', key: 'F5' };

    inputHandler(mockEvent, input);

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockWindow.loadURL).toHaveBeenCalled();
  });

  it('should intercept Ctrl+R reload', () => {
    handler = new NavigationHandler(mockWindow);
    handler.setupNavigationHandlers();

    const inputHandler = mockWindow.webContents.on.mock.calls.find(
      (call: any) => call[0] === 'before-input-event',
    )[1];

    const mockEvent = { preventDefault: jest.fn() };
    const input = { type: 'keyDown', key: 'r', control: true };

    inputHandler(mockEvent, input);

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockWindow.loadURL).toHaveBeenCalled();
  });

  it('should not intercept other key combinations', () => {
    handler = new NavigationHandler(mockWindow);
    handler.setupNavigationHandlers();

    const inputHandler = mockWindow.webContents.on.mock.calls.find(
      (call: any) => call[0] === 'before-input-event',
    )[1];

    const mockEvent = { preventDefault: jest.fn() };
    const input = { type: 'keyDown', key: 'a', control: true };

    inputHandler(mockEvent, input);

    expect(mockEvent.preventDefault).not.toHaveBeenCalled();
  });
});
