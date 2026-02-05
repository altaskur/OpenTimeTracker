import { describe, it, expect } from 'vitest';
import {
  UpdateInfo,
  DownloadProgress,
  UpdateSettings,
  UpdateStatus,
  UpdateError,
} from './update.interface.js';

describe('Update interfaces', () => {
  describe('UpdateInfo', () => {
    it('should create valid UpdateInfo with all properties', () => {
      const updateInfo: UpdateInfo = {
        version: '2.0.0',
        releaseDate: '2026-02-01',
        releaseName: 'Version 2.0.0',
        releaseNotes: 'New features',
        size: 1024000,
      };

      expect(updateInfo.version).toBe('2.0.0');
      expect(updateInfo.releaseDate).toBe('2026-02-01');
      expect(updateInfo.releaseName).toBe('Version 2.0.0');
      expect(updateInfo.releaseNotes).toBe('New features');
      expect(updateInfo.size).toBe(1024000);
    });

    it('should create valid UpdateInfo with only required properties', () => {
      const updateInfo: UpdateInfo = {
        version: '2.0.0',
        releaseDate: '2026-02-01',
      };

      expect(updateInfo.version).toBe('2.0.0');
      expect(updateInfo.releaseDate).toBe('2026-02-01');
      expect(updateInfo.releaseName).toBeUndefined();
      expect(updateInfo.releaseNotes).toBeUndefined();
      expect(updateInfo.size).toBeUndefined();
    });
  });

  describe('DownloadProgress', () => {
    it('should create valid DownloadProgress', () => {
      const progress: DownloadProgress = {
        bytesPerSecond: 1024000,
        percent: 45.67,
        transferred: 5000000,
        total: 10000000,
      };

      expect(progress.bytesPerSecond).toBe(1024000);
      expect(progress.percent).toBe(45.67);
      expect(progress.transferred).toBe(5000000);
      expect(progress.total).toBe(10000000);
    });
  });

  describe('UpdateSettings', () => {
    it('should create valid UpdateSettings with all properties', () => {
      const settings: UpdateSettings = {
        autoCheckEnabled: true,
        lastCheckDate: new Date('2026-02-01'),
      };

      expect(settings.autoCheckEnabled).toBe(true);
      expect(settings.lastCheckDate).toBeInstanceOf(Date);
    });

    it('should create valid UpdateSettings with only required properties', () => {
      const settings: UpdateSettings = {
        autoCheckEnabled: false,
      };

      expect(settings.autoCheckEnabled).toBe(false);
      expect(settings.lastCheckDate).toBeUndefined();
    });
  });

  describe('UpdateStatus', () => {
    it('should have correct enum values', () => {
      expect(UpdateStatus.Idle).toBe('idle');
      expect(UpdateStatus.Checking).toBe('checking');
      expect(UpdateStatus.Available).toBe('available');
      expect(UpdateStatus.NotAvailable).toBe('not-available');
      expect(UpdateStatus.Downloading).toBe('downloading');
      expect(UpdateStatus.Downloaded).toBe('downloaded');
      expect(UpdateStatus.Error).toBe('error');
    });

    it('should be assignable to variables', () => {
      const status: UpdateStatus = UpdateStatus.Checking;
      expect(status).toBe(UpdateStatus.Checking);
    });
  });

  describe('UpdateError', () => {
    it('should create valid UpdateError with all properties', () => {
      const error: UpdateError = {
        message: 'Update failed',
        code: 'ERR_UPDATE_FAILED',
      };

      expect(error.message).toBe('Update failed');
      expect(error.code).toBe('ERR_UPDATE_FAILED');
    });

    it('should create valid UpdateError with only required properties', () => {
      const error: UpdateError = {
        message: 'Update failed',
      };

      expect(error.message).toBe('Update failed');
      expect(error.code).toBeUndefined();
    });
  });
});
