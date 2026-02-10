import { ipcMain, app } from 'electron';
import { UpdateService } from '../update/update.service.js';

export const setupUpdateHandlers = (updateService: UpdateService): void => {
    ipcMain.handle('check-for-updates', () => updateService.checkForUpdates());
    ipcMain.handle('get-version', () => app.getVersion());
    ipcMain.handle('get-release-by-tag', (_event, tag: string) => updateService.getReleaseByTag(tag));
};
