import { Injectable } from '@angular/core';
import { MonthConfig, WorkConfig } from '../../../../types/electron';
import { BaseDatabaseService } from '../base-database.service';

/**
 * Service for work config and month config database operations.
 */
@Injectable({
  providedIn: 'root',
})
export class ConfigService extends BaseDatabaseService {
  // Work Config
  async getWorkConfig(): Promise<WorkConfig> {
    return this.executeWithErrorHandling('get work config', async () => {
      return globalThis.window.electronAPI.getWorkConfig();
    });
  }

  async updateWorkConfig(data: Partial<WorkConfig>): Promise<WorkConfig> {
    return this.executeWithErrorHandling('update work config', async () => {
      return globalThis.window.electronAPI.updateWorkConfig(data);
    });
  }

  // Month Config
  async getMonthConfig(year: number, month: number): Promise<MonthConfig> {
    return this.executeWithErrorHandling('get month config', async () => {
      return globalThis.window.electronAPI.getMonthConfig(year, month);
    });
  }

  async updateMonthConfig(
    year: number,
    month: number,
    data: Partial<MonthConfig>,
  ): Promise<MonthConfig> {
    return this.executeWithErrorHandling('update month config', async () => {
      return globalThis.window.electronAPI.updateMonthConfig(year, month, data);
    });
  }
}
