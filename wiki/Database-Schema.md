# Database Schema Documentation

This document provides detailed information about the OpenTimeTracker database schema, relationships, and data model.

## Overview

OpenTimeTracker uses **SQLite** as its database engine, managed through **Prisma ORM**. The schema is defined in `prisma/schema.prisma`.

## Schema File Location

- **Schema Definition**: `prisma/schema.prisma`
- **Migrations**: `prisma/migrations/`
- **Template Database**: `prisma/template.db` (used for new installations)

## Database Location

### Development
```
./dist/data/timetracker.db
```

### Production
- **Windows**: `%APPDATA%/OpenTimeTracker/data/timetracker.db`
- **macOS**: `~/Library/Application Support/OpenTimeTracker/data/timetracker.db`
- **Linux**: `~/.config/OpenTimeTracker/data/timetracker.db`

---

## Entity-Relationship Diagram

```
Project (1) ─── (N) Task (N) ─── (M) Tag
   │                 │
   │                 ├── (1) TaskStatus
   │                 │
   │                 └── (N) TimeEntry
   │
   └─── (N) AuditLog ─── (N) Task

WorkConfig (Singleton) ─── (Override) ─── MonthConfig

DayType (1) ─── (N) DayOverride

AppSettings (Singleton)

ActionHistory (Independent)
```

---

## Core Entities

### Project

**Table**: `projects`

Represents a project that groups related tasks.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `id` | String | UUID primary key | Primary Key |
| `name` | String | Project name | Required |
| `description` | String? | Project description | Optional |
| `isClosed` | Boolean | Whether project is closed | Default: false |
| `createdAt` | DateTime | Creation timestamp | Auto-generated |
| `updatedAt` | DateTime | Last update timestamp | Auto-updated |

**Relationships**:
- `tasks` → Task[] (One-to-Many)
- `auditLogs` → AuditLog[] (One-to-Many)

**Example**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Website Redesign",
  "description": "Complete redesign of company website",
  "isClosed": false,
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

---

### Task

**Table**: `tasks`

Represents a task within a project.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `id` | String | UUID primary key | Primary Key |
| `projectId` | String | Foreign key to Project | Required, CASCADE |
| `name` | String | Task name | Required |
| `description` | String? | Task description | Optional |
| `estimatedHours` | Float? | Estimated time to complete | Optional |
| `statusId` | String? | Foreign key to TaskStatus | Optional |
| `createdAt` | DateTime | Creation timestamp | Auto-generated |
| `updatedAt` | DateTime | Last update timestamp | Auto-updated |

**Relationships**:
- `project` → Project (Many-to-One)
- `status` → TaskStatus (Many-to-One, optional)
- `tags` → TaskTag[] (One-to-Many)
- `timeEntries` → TimeEntry[] (One-to-Many)
- `auditLogs` → AuditLog[] (One-to-Many)

**Delete Behavior**:
- When Project is deleted → CASCADE (task is deleted)
- When TaskStatus is deleted → SET NULL (status becomes null)

---

### Tag

**Table**: `tags`

Reusable labels for categorizing tasks.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `id` | String | UUID primary key | Primary Key |
| `name` | String | Tag name | Required, Unique |

**Relationships**:
- `tasks` → TaskTag[] (One-to-Many)

**Example**:
```json
{
  "id": "abc123...",
  "name": "frontend"
}
```

---

### TaskTag (Join Table)

**Table**: `task_tags`

Many-to-many relationship between Tasks and Tags.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `taskId` | String | Foreign key to Task | Composite Primary Key |
| `tagId` | String | Foreign key to Tag | Composite Primary Key |

**Relationships**:
- `task` → Task (Many-to-One, CASCADE)
- `tag` → Tag (Many-to-One, CASCADE)

---

### TaskStatus

**Table**: `task_status`

Defines workflow states for tasks (e.g., "To Do", "In Progress", "Done").

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `id` | String | UUID primary key | Primary Key |
| `name` | String | Status name | Required, Unique |
| `color` | String | Hex color code | Default: "#6b7280" |
| `isDefault` | Boolean | Whether this is the default status | Default: false |

**Relationships**:
- `tasks` → Task[] (One-to-Many)

**Example**:
```json
{
  "id": "def456...",
  "name": "In Progress",
  "color": "#3b82f6",
  "isDefault": false
}
```

---

### TimeEntry

**Table**: `time_entries`

Records time worked on tasks.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `id` | String | UUID primary key | Primary Key |
| `taskId` | String? | Foreign key to Task | Optional, SET NULL |
| `date` | String | Date in YYYY-MM-DD format | Required |
| `minutes` | Int | Time worked in minutes | Required |
| `notes` | String? | Notes about the work | Optional |
| `createdAt` | DateTime | Creation timestamp | Auto-generated |
| `updatedAt` | DateTime | Last update timestamp | Auto-updated |

**Relationships**:
- `task` → Task (Many-to-One, optional, SET NULL on delete)

**Note**: Time entries can exist without a task (unassigned time).

**Example**:
```json
{
  "id": "ghi789...",
  "taskId": "task-uuid",
  "date": "2024-01-15",
  "minutes": 120,
  "notes": "Implemented user authentication",
  "createdAt": "2024-01-15T14:30:00Z",
  "updatedAt": "2024-01-15T14:30:00Z"
}
```

---

## Work Configuration

### WorkConfig (Singleton)

**Table**: `work_config`

Global work configuration template. Only one record exists (id: "work_config").

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `id` | String | Fixed ID "work_config" | Primary Key |
| `dailyMinutes` | Int | Default daily work minutes | Default: 480 (8 hours) |
| `weeklyMinutes` | Int | Target weekly work minutes | Default: 2400 (40 hours) |
| `workDays` | String | CSV of work days (1=Mon, 7=Sun) | Default: "1,2,3,4,5" |
| `daySchedule` | String | JSON of per-day minutes | Default: Mon-Fri 480 min |
| `createdAt` | DateTime | Creation timestamp | Auto-generated |
| `updatedAt` | DateTime | Last update timestamp | Auto-updated |

**Example**:
```json
{
  "id": "work_config",
  "dailyMinutes": 480,
  "weeklyMinutes": 2400,
  "workDays": "1,2,3,4,5",
  "daySchedule": "{\"1\":480,\"2\":480,\"3\":480,\"4\":480,\"5\":480}",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-15T12:00:00Z"
}
```

---

### MonthConfig

**Table**: `month_configs`

Month-specific overrides for work configuration.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `id` | String | UUID primary key | Primary Key |
| `year` | Int | Year (e.g., 2024) | Unique with month |
| `month` | Int | Month (1-12) | Unique with year |
| `weeklyMinutes` | Int | Weekly target for this month | Default: 2400 |
| `workDays` | String | CSV of work days | Default: "1,2,3,4,5" |
| `daySchedule` | String | JSON of per-day minutes | Default: standard schedule |
| `createdAt` | DateTime | Creation timestamp | Auto-generated |
| `updatedAt` | DateTime | Last update timestamp | Auto-updated |

**Unique Constraint**: `(year, month)`

**Example**:
```json
{
  "id": "jkl012...",
  "year": 2024,
  "month": 12,
  "weeklyMinutes": 2000,
  "workDays": "1,2,3,4",
  "daySchedule": "{\"1\":500,\"2\":500,\"3\":500,\"4\":500}",
  "createdAt": "2024-11-01T00:00:00Z",
  "updatedAt": "2024-11-01T00:00:00Z"
}
```

---

## Special Days

### DayType

**Table**: `day_types`

Types of special days (holidays, vacation, sick leave, etc.).

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `id` | String | UUID primary key | Primary Key |
| `name` | String | Day type name | Required, Unique |
| `color` | String | Hex color code | Default: "#6b7280" |
| `defaultMinutes` | Int | Default work minutes for this type | Default: 0 |
| `createdAt` | DateTime | Creation timestamp | Auto-generated |

**Relationships**:
- `dayOverrides` → DayOverride[] (One-to-Many)

**Example**:
```json
{
  "id": "mno345...",
  "name": "Holiday",
  "color": "#ef4444",
  "defaultMinutes": 0,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

### DayOverride

**Table**: `day_overrides`

Overrides for specific dates.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `id` | String | UUID primary key | Primary Key |
| `date` | String | Date in YYYY-MM-DD format | Required, Unique |
| `dayTypeId` | String? | Foreign key to DayType | Optional, SET NULL |
| `minutes` | Int? | Custom work minutes for this day | Optional |
| `note` | String? | Note about the day | Optional |
| `createdAt` | DateTime | Creation timestamp | Auto-generated |
| `updatedAt` | DateTime | Last update timestamp | Auto-updated |

**Relationships**:
- `dayType` → DayType (Many-to-One, optional, SET NULL on delete)

**Example**:
```json
{
  "id": "pqr678...",
  "date": "2024-12-25",
  "dayTypeId": "holiday-id",
  "minutes": 0,
  "note": "Christmas Day",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

---

## Application Data

### AppSettings (Singleton)

**Table**: `app_settings`

Application-wide settings. Only one record exists (id: "app_settings").

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `id` | String | Fixed ID "app_settings" | Primary Key |
| `darkMode` | Boolean | Dark mode enabled | Default: true |
| `language` | String | UI language ("en" or "es") | Default: "es" |
| `createdAt` | DateTime | Creation timestamp | Auto-generated |
| `updatedAt` | DateTime | Last update timestamp | Auto-updated |

**Example**:
```json
{
  "id": "app_settings",
  "darkMode": true,
  "language": "es",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

---

## Audit & History

### AuditLog

**Table**: `audit_logs`

Tracks changes to entities for audit purposes.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `id` | String | UUID primary key | Primary Key |
| `entityType` | String | Type of entity (e.g., "Project") | Required |
| `entityId` | String | ID of the entity | Required |
| `action` | String | Action performed (e.g., "CREATE") | Required |
| `changes` | String? | JSON of changes made | Optional |
| `userName` | String? | User who made the change | Optional |
| `createdAt` | DateTime | When the action occurred | Auto-generated |
| `projectId` | String? | Related project ID | Optional, CASCADE |
| `taskId` | String? | Related task ID | Optional, CASCADE |

**Relationships**:
- `project` → Project (Many-to-One, optional, CASCADE)
- `task` → Task (Many-to-One, optional, CASCADE)

---

### ActionHistory

**Table**: `action_history`

Records actions for undo/redo functionality.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `id` | String | UUID primary key | Primary Key |
| `entityType` | String | Type of entity | Required |
| `entityId` | String | ID of the entity | Required |
| `actionType` | String | Type of action | Required |
| `description` | String | Human-readable description | Required |
| `previousData` | String? | JSON of previous state | Optional |
| `newData` | String? | JSON of new state | Optional |
| `undone` | Boolean | Whether action has been undone | Default: false |
| `createdAt` | DateTime | When the action occurred | Auto-generated |

**Example**:
```json
{
  "id": "stu901...",
  "entityType": "Task",
  "entityId": "task-uuid",
  "actionType": "UPDATE",
  "description": "Updated task status to 'Done'",
  "previousData": "{\"statusId\":\"in-progress-id\"}",
  "newData": "{\"statusId\":\"done-id\"}",
  "undone": false,
  "createdAt": "2024-01-15T15:30:00Z"
}
```

---

## Indexes

The following indexes are automatically created by Prisma:

- **Primary Keys**: All tables have UUID primary keys
- **Unique Constraints**:
  - `tags.name`
  - `task_status.name`
  - `work_periods.{year, month}`
  - `month_configs.{year, month}`
  - `day_overrides.date`
- **Foreign Keys**: All relationships have FK indexes

---

## Migrations

### Creating a Migration

When modifying the schema:

```bash
npx prisma migrate dev --name description_of_change
```

This creates a new migration file in `prisma/migrations/`.

### Applying Migrations

Migrations are automatically applied when:
- Running `npm run dev`
- On first application start (production)

### Migration Files

Location: `prisma/migrations/TIMESTAMP_migration_name/`

Each migration contains:
- `migration.sql` - SQL statements to apply

---

## Database Operations

### Common Queries

**Create a Project**:
```typescript
await prisma.project.create({
  data: {
    name: "New Project",
    description: "Project description"
  }
})
```

**Get Projects with Tasks**:
```typescript
await prisma.project.findMany({
  include: {
    tasks: {
      include: {
        status: true,
        tags: { include: { tag: true } }
      }
    }
  },
  where: { isClosed: false }
})
```

**Create Time Entry**:
```typescript
await prisma.timeEntry.create({
  data: {
    taskId: "task-uuid",
    date: "2024-01-15",
    minutes: 120,
    notes: "Worked on feature X"
  }
})
```

**Get Time Entries for Date Range**:
```typescript
await prisma.timeEntry.findMany({
  where: {
    date: {
      gte: "2024-01-01",
      lte: "2024-01-31"
    }
  },
  include: { task: true },
  orderBy: { date: 'desc' }
})
```

---

## Backup & Restore

### Automatic Backups

- **Trigger**: Application shutdown
- **Location**: `{app-data}/backups/`
- **Format**: `timetracker-backup-YYYY-MM-DD-HH-mm-ss.db`
- **Method**: SQLite file copy

### Manual Backup

Simply copy the database file:

```bash
# Linux/macOS
cp ~/.config/OpenTimeTracker/data/timetracker.db ~/my-backup.db

# Windows
copy %APPDATA%\OpenTimeTracker\data\timetracker.db C:\my-backup.db
```

### Restore

Replace the database file with a backup:

1. Close OpenTimeTracker
2. Copy backup file to database location
3. Rename to `timetracker.db`
4. Restart OpenTimeTracker

---

## Schema Evolution

### Best Practices

1. **Always create migrations** for schema changes
2. **Test migrations** on a copy of production data
3. **Update `prisma/template.db`** after migrations:
   ```bash
   npm run prisma:template
   ```
4. **Never commit real user data** to the repository

### Breaking Changes

When making breaking changes:

1. Create a migration
2. Add data transformation logic if needed
3. Update Prisma client generation
4. Test thoroughly
5. Document in release notes

---

## Performance Considerations

### Query Optimization

- Use `include` judiciously (only load needed relations)
- Use `select` to limit fields returned
- Add indexes for frequently queried fields

### Data Volume

SQLite performs well for:
- Thousands of projects
- Tens of thousands of tasks
- Hundreds of thousands of time entries

For larger datasets, consider:
- Archiving old data
- Database vacuuming: `VACUUM;`
- Analyzing query performance

---

## Troubleshooting

### Database Locked

**Cause**: Multiple processes accessing the database

**Solution**: Ensure only one OpenTimeTracker instance is running

### Corrupted Database

**Cause**: Application crash, disk issues

**Solution**: Restore from backup

### Migration Failures

**Cause**: Schema conflicts, data inconsistencies

**Solution**: 
1. Backup database
2. Reset migrations: `npx prisma migrate reset`
3. Restore data manually if needed

---

## Related Documentation

- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Architecture Guide](Architecture.md)
