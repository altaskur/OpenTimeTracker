import { Injectable } from '@angular/core';
import { DayOverride, DayType, DeleteResult } from '../../../../types/electron';
import { BaseDatabaseService } from '../base-database.service';

/**
 * Service for day type and day override database operations.
 */
@Injectable({
  providedIn: 'root',
})
export class DayService extends BaseDatabaseService {
  // Day Types
  async getDayTypes(): Promise<DayType[]> {
    return this.executeWithErrorHandling('get day types', async () => {
      return globalThis.window.electronAPI.getDayTypes();
    });
  }

  async createDayType(
    name: string,
    color: string,
    defaultMinutes?: number,
  ): Promise<DayType> {
    return this.executeWithErrorHandling('create day type', async () => {
      return globalThis.window.electronAPI.createDayType(
        name,
        color,
        defaultMinutes,
      );
    });
  }

  async updateDayType(id: string, data: Partial<DayType>): Promise<DayType> {
    return this.executeWithErrorHandling('update day type', async () => {
      return globalThis.window.electronAPI.updateDayType(id, data);
    });
  }

  async deleteDayType(id: string): Promise<DeleteResult> {
    return this.executeWithErrorHandling('delete day type', async () => {
      return globalThis.window.electronAPI.deleteDayType(id);
    });
  }

  // Day Overrides
  async getDayOverrides(
    startDate?: string,
    endDate?: string,
  ): Promise<DayOverride[]> {
    return this.executeWithErrorHandling('get day overrides', async () => {
      return globalThis.window.electronAPI.getDayOverrides(startDate, endDate);
    });
  }

  async getDayOverride(date: string): Promise<DayOverride | null> {
    return this.executeWithErrorHandling('get day override', async () => {
      return globalThis.window.electronAPI.getDayOverride(date);
    });
  }

  async createDayOverride(
    date: string,
    dayTypeId?: string,
    minutes?: number,
    note?: string,
  ): Promise<DayOverride> {
    return this.executeWithErrorHandling('create day override', async () => {
      return globalThis.window.electronAPI.createDayOverride(
        date,
        dayTypeId,
        minutes,
        note,
      );
    });
  }

  async updateDayOverride(
    id: string,
    data: Partial<DayOverride>,
  ): Promise<DayOverride> {
    return this.executeWithErrorHandling('update day override', async () => {
      return globalThis.window.electronAPI.updateDayOverride(id, data);
    });
  }

  async upsertDayOverride(
    date: string,
    dayTypeId?: string,
    minutes?: number,
    note?: string,
  ): Promise<DayOverride> {
    return this.executeWithErrorHandling('upsert day override', async () => {
      return globalThis.window.electronAPI.upsertDayOverride(
        date,
        dayTypeId,
        minutes,
        note,
      );
    });
  }

  async deleteDayOverride(date: string): Promise<DeleteResult> {
    return this.executeWithErrorHandling('delete day override', async () => {
      return globalThis.window.electronAPI.deleteDayOverride(date);
    });
  }
}
