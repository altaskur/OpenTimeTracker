import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { app } from 'electron';
import { UpdateService } from './update.service.js';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('UpdateService', () => {
  let updateService: UpdateService;

  beforeEach(() => {
    vi.clearAllMocks();
    updateService = new UpdateService();
    (app.getVersion as Mock).mockReturnValue('1.0.0');
  });

  describe('checkForUpdates', () => {
    it('should return updateAvailable true when newer version exists', async () => {
      const mockRelease = {
        tag_name: 'v2.0.0',
        html_url:
          'https://github.com/altaskur/OpenTimeTracker/releases/tag/v2.0.0',
        body: 'Release notes for v2.0.0',
        draft: false,
        prerelease: false,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([mockRelease]),
      });

      const result = await updateService.checkForUpdates();

      expect(result.updateAvailable).toBe(true);
      expect(result.version).toBe('2.0.0');
      expect(result.url).toBe(mockRelease.html_url);
      expect(result.releaseNotes).toBe(mockRelease.body);
    });

    it('should return updateAvailable false when current version is latest', async () => {
      const mockRelease = {
        tag_name: 'v1.0.0',
        html_url:
          'https://github.com/altaskur/OpenTimeTracker/releases/tag/v1.0.0',
        body: 'Current version notes',
        draft: false,
        prerelease: false,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([mockRelease]),
      });

      const result = await updateService.checkForUpdates();

      expect(result.updateAvailable).toBe(false);
      expect(result.version).toBe('1.0.0');
    });

    it('should return updateAvailable false when current version is newer', async () => {
      const mockRelease = {
        tag_name: 'v0.9.0',
        html_url:
          'https://github.com/altaskur/OpenTimeTracker/releases/tag/v0.9.0',
        body: 'Old version notes',
        draft: false,
        prerelease: false,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([mockRelease]),
      });

      const result = await updateService.checkForUpdates();

      expect(result.updateAvailable).toBe(false);
    });

    it('should return updateAvailable false when fetch fails', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
      });

      const result = await updateService.checkForUpdates();

      expect(result.updateAvailable).toBe(false);
      expect(result.version).toBe('');
      expect(result.url).toBe('');
    });

    it('should return updateAvailable false on network error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await updateService.checkForUpdates();

      expect(result.updateAvailable).toBe(false);
      expect(result.version).toBe('');
      expect(result.url).toBe('');
    });

    it('should handle version tags without v prefix', async () => {
      const mockRelease = {
        tag_name: '2.0.0',
        html_url:
          'https://github.com/altaskur/OpenTimeTracker/releases/tag/2.0.0',
        body: 'Notes',
        draft: false,
        prerelease: false,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([mockRelease]),
      });

      const result = await updateService.checkForUpdates();

      expect(result.updateAvailable).toBe(true);
      expect(result.version).toBe('2.0.0');
    });

    it('should ignore draft releases', async () => {
      const mockReleases = [
        {
          tag_name: 'v2.0.0',
          html_url:
            'https://github.com/altaskur/OpenTimeTracker/releases/tag/v2.0.0',
          body: 'Draft release',
          draft: true,
          prerelease: false,
        },
        {
          tag_name: 'v1.0.0',
          html_url:
            'https://github.com/altaskur/OpenTimeTracker/releases/tag/v1.0.0',
          body: 'Release notes',
          draft: false,
          prerelease: false,
        },
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockReleases),
      });

      const result = await updateService.checkForUpdates();

      expect(result.updateAvailable).toBe(false);
      expect(result.version).toBe('1.0.0');
    });
  });

  describe('getReleaseByTag', () => {
    it('should return release data for valid tag', async () => {
      const mockRelease = {
        tag_name: 'v1.0.0',
        html_url:
          'https://github.com/altaskur/OpenTimeTracker/releases/tag/v1.0.0',
        body: 'Release notes for v1.0.0',
        draft: false,
        prerelease: false,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockRelease),
      });

      const result = await updateService.getReleaseByTag('v1.0.0');

      expect(result).toEqual(mockRelease);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/altaskur/OpenTimeTracker/releases/tags/v1.0.0',
        expect.objectContaining({
          headers: expect.objectContaining({
            'User-Agent': 'OpenTimeTracker/1.0.0',
            Accept: 'application/vnd.github.v3+json',
          }),
        }),
      );
    });

    it('should return null when release not found', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
      });

      const result = await updateService.getReleaseByTag('v99.99.99');

      expect(result).toBeNull();
    });

    it('should return null on network error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await updateService.getReleaseByTag('v1.0.0');

      expect(result).toBeNull();
    });
  });

  describe('compareVersions', () => {
    // Access private method via prototype for testing
    const compareVersions = (v1: string, v2: string): number => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (updateService as any).compareVersions(v1, v2);
    };

    it('should return 1 when first version is greater', () => {
      expect(compareVersions('2.0.0', '1.0.0')).toBe(1);
      expect(compareVersions('1.1.0', '1.0.0')).toBe(1);
      expect(compareVersions('1.0.1', '1.0.0')).toBe(1);
      expect(compareVersions('1.0.0', '0.9.9')).toBe(1);
    });

    it('should return -1 when first version is less', () => {
      expect(compareVersions('1.0.0', '2.0.0')).toBe(-1);
      expect(compareVersions('1.0.0', '1.1.0')).toBe(-1);
      expect(compareVersions('1.0.0', '1.0.1')).toBe(-1);
      expect(compareVersions('0.9.9', '1.0.0')).toBe(-1);
    });

    it('should return 0 when versions are equal', () => {
      expect(compareVersions('1.0.0', '1.0.0')).toBe(0);
      expect(compareVersions('2.5.3', '2.5.3')).toBe(0);
    });

    it('should handle versions with different part counts', () => {
      expect(compareVersions('1.0.0', '1.0')).toBe(0);
      expect(compareVersions('1.0', '1.0.0')).toBe(0);
      expect(compareVersions('1.0.1', '1.0')).toBe(1);
      expect(compareVersions('1.0', '1.0.1')).toBe(-1);
    });

    // Prerelease version comparison tests
    describe('prerelease versions', () => {
      it('should detect alpha version increments', () => {
        expect(compareVersions('1.0.0-alpha.7', '1.0.0-alpha.6')).toBe(1);
        expect(compareVersions('1.0.0-alpha.10', '1.0.0-alpha.9')).toBe(1);
        expect(compareVersions('1.0.0-alpha.2', '1.0.0-alpha.10')).toBe(-1);
      });

      it('should detect beta version increments', () => {
        expect(compareVersions('1.0.0-beta.3', '1.0.0-beta.2')).toBe(1);
        expect(compareVersions('1.0.0-beta.1', '1.0.0-beta.5')).toBe(-1);
      });

      it('should detect rc version increments', () => {
        expect(compareVersions('1.0.0-rc.2', '1.0.0-rc.1')).toBe(1);
        expect(compareVersions('1.0.0-rc.1', '1.0.0-rc.3')).toBe(-1);
      });

      it('should compare beta > alpha', () => {
        expect(compareVersions('1.0.0-beta.1', '1.0.0-alpha.9')).toBe(1);
        expect(compareVersions('1.0.0-alpha.9', '1.0.0-beta.1')).toBe(-1);
      });

      it('should compare rc > beta', () => {
        expect(compareVersions('1.0.0-rc.1', '1.0.0-beta.9')).toBe(1);
        expect(compareVersions('1.0.0-beta.9', '1.0.0-rc.1')).toBe(-1);
      });

      it('should compare rc > alpha', () => {
        expect(compareVersions('1.0.0-rc.1', '1.0.0-alpha.9')).toBe(1);
        expect(compareVersions('1.0.0-alpha.9', '1.0.0-rc.1')).toBe(-1);
      });

      it('should compare release > any prerelease', () => {
        expect(compareVersions('1.0.0', '1.0.0-alpha.9')).toBe(1);
        expect(compareVersions('1.0.0', '1.0.0-beta.5')).toBe(1);
        expect(compareVersions('1.0.0', '1.0.0-rc.3')).toBe(1);

        expect(compareVersions('1.0.0-alpha.9', '1.0.0')).toBe(-1);
        expect(compareVersions('1.0.0-beta.5', '1.0.0')).toBe(-1);
        expect(compareVersions('1.0.0-rc.3', '1.0.0')).toBe(-1);
      });

      it('should handle major.minor.patch changes with prereleases', () => {
        expect(compareVersions('1.0.1-alpha.1', '1.0.0')).toBe(1);
        expect(compareVersions('1.1.0-alpha.1', '1.0.0')).toBe(1);
        expect(compareVersions('2.0.0-alpha.1', '1.9.9')).toBe(1);
      });

      it('should handle equal prerelease versions', () => {
        expect(compareVersions('1.0.0-alpha.5', '1.0.0-alpha.5')).toBe(0);
        expect(compareVersions('1.0.0-beta.2', '1.0.0-beta.2')).toBe(0);
        expect(compareVersions('1.0.0-rc.1', '1.0.0-rc.1')).toBe(0);
      });
    });
  });
});
