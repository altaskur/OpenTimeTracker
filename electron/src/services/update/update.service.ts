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
  private readonly GITHUB_API_URL =
    'https://api.github.com/repos/altaskur/OpenTimeTracker/releases/latest';

  async checkForUpdates(): Promise<UpdateCheckResult> {
    try {
      const response = await fetch(this.GITHUB_API_URL, {
        headers: {
          'User-Agent': `OpenTimeTracker/${app.getVersion()}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        console.error('Failed to check for updates:', response.statusText);
        return { updateAvailable: false, version: '', url: '' };
      }

      const release = (await response.json()) as GitHubRelease;
      const latestVersion = release.tag_name.replace(/^v/, '');
      const currentVersion = app.getVersion();

      const updateAvailable =
        this.compareVersions(latestVersion, currentVersion) > 0;

      return {
        updateAvailable,
        version: latestVersion,
        url: release.html_url,
        releaseNotes: release.body,
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
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        console.error(`Failed to fetch release ${tag}:`, response.statusText);
        return null;
      }

      return (await response.json()) as GitHubRelease;
    } catch (error) {
      console.error(`Error fetching release ${tag}:`, error);
      return null;
    }
  }

  /**
   * Compares two semantic versions following semver 2.0 specification
   * Supports prerelease versions (alpha, beta, rc)
   *
   * Returns:
   *  1 if v1 > v2
   * -1 if v1 < v2
   *  0 if v1 === v2
   *
   * Examples:
   *  - compareVersions("1.0.0-alpha.7", "1.0.0-alpha.6") => 1
   *  - compareVersions("1.0.0-beta.1", "1.0.0-alpha.9") => 1
   *  - compareVersions("1.0.0", "1.0.0-rc.5") => 1
   */
  private compareVersions(v1: string, v2: string): number {
    const parsed1 = this.parseVersion(v1);
    const parsed2 = this.parseVersion(v2);

    // Compare major, minor, patch
    if (parsed1.major !== parsed2.major) {
      return parsed1.major > parsed2.major ? 1 : -1;
    }
    if (parsed1.minor !== parsed2.minor) {
      return parsed1.minor > parsed2.minor ? 1 : -1;
    }
    if (parsed1.patch !== parsed2.patch) {
      return parsed1.patch > parsed2.patch ? 1 : -1;
    }

    // If both have no prerelease, they're equal
    if (!parsed1.prerelease && !parsed2.prerelease) {
      return 0;
    }

    // Version without prerelease is greater than with prerelease
    // (1.0.0 > 1.0.0-alpha.1)
    if (!parsed1.prerelease && parsed2.prerelease) {
      return 1;
    }
    if (parsed1.prerelease && !parsed2.prerelease) {
      return -1;
    }

    // Both have prereleases, compare them
    return this.comparePrereleases(parsed1.prerelease!, parsed2.prerelease!);
  }

  /**
   * Parses a version string into components
   * Example: "1.0.0-alpha.7" => { major: 1, minor: 0, patch: 0, prerelease: "alpha.7" }
   */
  private parseVersion(version: string): {
    major: number;
    minor: number;
    patch: number;
    prerelease?: string;
  } {
    const parts = version.split('-');
    const versionParts = parts[0].split('.').map(Number);

    return {
      major: versionParts[0] || 0,
      minor: versionParts[1] || 0,
      patch: versionParts[2] || 0,
      prerelease: parts[1] || undefined,
    };
  }

  /**
   * Compares two prerelease strings
   * Follows precedence: alpha < beta < rc
   * Then compares numeric parts
   *
   * Examples:
   *  - comparePrereleases("alpha.7", "alpha.6") => 1
   *  - comparePrereleases("beta.1", "alpha.9") => 1
   */
  private comparePrereleases(pre1: string, pre2: string): number {
    const parts1 = pre1.split('.');
    const parts2 = pre2.split('.');

    const precedence: Record<string, number> = {
      alpha: 1,
      beta: 2,
      rc: 3,
    };

    // Compare identifier (alpha, beta, rc)
    const type1 = parts1[0];
    const type2 = parts2[0];

    const order1 = precedence[type1] || 0;
    const order2 = precedence[type2] || 0;

    if (order1 !== order2) {
      return order1 > order2 ? 1 : -1;
    }

    // Same type, compare numeric parts
    const len = Math.max(parts1.length, parts2.length);
    for (let i = 1; i < len; i++) {
      const num1 = parseInt(parts1[i]) || 0;
      const num2 = parseInt(parts2[i]) || 0;

      if (num1 !== num2) {
        return num1 > num2 ? 1 : -1;
      }
    }

    return 0;
  }
}
