import { Injectable } from '@angular/core';
import {
  DeleteResult,
  TimeEntry,
  WorkPeriod,
} from '../../../../types/electron';
import { BaseDatabaseService } from '../base-database.service';

/**
 * Service for time entry and work period database operations.
 */
@Injectable({
  providedIn: 'root',
})
export class TimeEntryService extends BaseDatabaseService {
  // Time Entries
  async getTimeEntries(taskId?: string): Promise<TimeEntry[]> {
    return this.executeWithErrorHandling('get time entries', async () => {
      return globalThis.window.electronAPI.getTimeEntries(taskId);
    });
  }

  async getTimeEntriesByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<TimeEntry[]> {
    return this.executeWithErrorHandling(
      'get time entries by date range',
      async () => {
        return globalThis.window.electronAPI.getTimeEntriesByDateRange(
          startDate,
          endDate,
        );
      },
    );
  }

  async getTimeEntriesByDate(date: string): Promise<TimeEntry[]> {
    return this.executeWithErrorHandling(
      'get time entries by date',
      async () => {
        return globalThis.window.electronAPI.getTimeEntriesByDate(date);
      },
    );
  }

  async getPendingTimeEntries(): Promise<TimeEntry[]> {
    return this.executeWithErrorHandling(
      'get pending time entries',
      async () => {
        return globalThis.window.electronAPI.getPendingTimeEntries();
      },
    );
  }

  async createTimeEntry(
    date: string,
    minutes: number,
    taskId?: string,
    notes?: string,
  ): Promise<TimeEntry> {
    return this.executeWithErrorHandling('create time entry', async () => {
      return globalThis.window.electronAPI.createTimeEntry(
        date,
        minutes,
        taskId,
        notes,
      );
    });
  }

  async updateTimeEntry(
    id: string,
    data: Partial<TimeEntry>,
  ): Promise<TimeEntry> {
    return this.executeWithErrorHandling('update time entry', async () => {
      return globalThis.window.electronAPI.updateTimeEntry(id, data);
    });
  }

  async deleteTimeEntry(id: string): Promise<DeleteResult> {
    return this.executeWithErrorHandling('delete time entry', async () => {
      return globalThis.window.electronAPI.deleteTimeEntry(id);
    });
  }

  // Work Periods
  async getWorkPeriods(): Promise<WorkPeriod[]> {
    return this.executeWithErrorHandling('get work periods', async () => {
      return globalThis.window.electronAPI.getWorkPeriods();
    });
  }

  async getWorkPeriod(year: number, month: number): Promise<WorkPeriod | null> {
    return this.executeWithErrorHandling('get work period', async () => {
      return globalThis.window.electronAPI.getWorkPeriod(year, month);
    });
  }

  async createWorkPeriod(
    year: number,
    month: number,
    plannedHours: number,
    note?: string,
  ): Promise<WorkPeriod> {
    return this.executeWithErrorHandling('create work period', async () => {
      return globalThis.window.electronAPI.createWorkPeriod(
        year,
        month,
        plannedHours,
        note,
      );
    });
  }

  async updateWorkPeriod(
    year: number,
    month: number,
    data: { plannedHours?: number; note?: string },
  ): Promise<WorkPeriod> {
    return this.executeWithErrorHandling('update work period', async () => {
      return globalThis.window.electronAPI.updateWorkPeriod(year, month, data);
    });
  }

  async upsertWorkPeriod(
    year: number,
    month: number,
    plannedHours: number,
    note?: string,
  ): Promise<WorkPeriod> {
    return this.executeWithErrorHandling('upsert work period', async () => {
      return globalThis.window.electronAPI.upsertWorkPeriod(
        year,
        month,
        plannedHours,
        note,
      );
    });
  }
}
