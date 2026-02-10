import { app } from 'electron';

export interface UpdateCheckResult {
  updateAvailable: boolean;
  version: string;
  url: string;
  releaseNotes?: string;
}

interface GitHubRelease {
  tag_name: string;
  html_url: string;
  body: string;
}

export class UpdateService {
  private readonly GITHUB_API_URL = 'https://api.github.com/repos/altaskur/OpenTimeTracker/releases/latest';

  async checkForUpdates(): Promise<UpdateCheckResult> {
    try {
      const response = await fetch(this.GITHUB_API_URL, {
        headers: {
          'User-Agent': `OpenTimeTracker/${app.getVersion()}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        console.error('Failed to check for updates:', response.statusText);
        return { updateAvailable: false, version: '', url: '' };
      }

      const release = await response.json() as GitHubRelease;
      const latestVersion = release.tag_name.replace(/^v/, '');
      const currentVersion = app.getVersion();

      const updateAvailable = this.compareVersions(latestVersion, currentVersion) > 0;

      return {
        updateAvailable,
        version: latestVersion,
        url: release.html_url,
        releaseNotes: release.body
      };
    } catch (error) {
      console.error('Error checking for updates:', error);
      return { updateAvailable: false, version: '', url: '' };
    }
  }

  async getReleaseByTag(tag: string): Promise<GitHubRelease | null> {
    try {
      const url = `https://api.github.com/repos/altaskur/OpenTimeTracker/releases/tags/${tag}`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': `OpenTimeTracker/${app.getVersion()}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        console.error(`Failed to fetch release ${tag}:`, response.statusText);
        return null;
      }

      return await response.json() as GitHubRelease;
    } catch (error) {
      console.error(`Error fetching release ${tag}:`, error);
      return null;
    }
  }

  /*
   * Returns:
   *  1 if v1 > v2
   * -1 if v1 < v2
   *  0 if v1 === v2
   */
  private compareVersions(v1: string, v2: string): number {
    const p1 = v1.split('.').map(Number);
    const p2 = v2.split('.').map(Number);
    const len = Math.max(p1.length, p2.length);

    for (let i = 0; i < len; i++) {
      const n1 = p1[i] || 0;
      const n2 = p2[i] || 0;
      if (n1 > n2) return 1;
      if (n1 < n2) return -1;
    }
    return 0;
  }
}
