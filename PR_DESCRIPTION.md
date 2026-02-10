## Description

This PR refactors the applications update system to improve user experience, security, and maintainability. It introduces a redesigned update settings UI, securely handles external links via IPC, and fixes several bugs related to dialog visibility and change detection. Additionally, it addresses unit test failures by updating mocks to match new interfaces.

### Goal

- **Improve UX:** Provide a clear and responsive interface for checking updates and viewing release notes.
- **Enhance Security:** Replace direct `shell.openExternal` calls in the renderer with a secure IPC handler.
- **Fix Bugs:** Resolve issues where the release notes dialog would not appear immediately due to Angular change detection timing.
- **Maintain Code Quality:** Fix linting errors and update unit tests to reflect recent changes in `UpdateService`.

### Key Changes

- **Refactored Update UI:** Redesigned `OpenSettingsUpdatesComponent` and introduced `UpdateDialogComponent` to display release notes with proper formatting.
- **Secure External Links:** Implemented a new `open-external` IPC handler in the main process and exposed it via `preload.ts`, ensuring all links open in the default browser securely.
- **Dialog Visibility Fix:** Implemented `setTimeout` and `NgZone.run` in `showCurrentVersionNotes` to force Angular change detection and ensure the dialog opens immediately.
- **Type Safety:** Added `GitHubRelease` interface and updated `electron.d.ts` and `UpdateService` to use strict typing instead of `any`.
- **Unit Test Fixes:** Updated mocks in `app.spec.ts` and `open-settings-updates.spec.ts` to include the missing `lastChecked` signal and correct `GitHubRelease` structure, resolving generic `TypeError` failures.

## Type of Change

- [x] 🐛 Bug fix (non-breaking change which fixes an issue)
- [x] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📝 Documentation update
- [x] 🎨 Style/UI changes
- [x] ♻️ Refactoring (no functional changes)
- [ ] ⚡ Performance improvement
- [x] ✅ Test updates
- [ ] 🔧 Build/configuration changes

## Impact Assessment

### Database Impact

- [x] No database changes
- [ ] New migration(s) included
- [ ] Existing data migration required

### Backup Impact

- [x] No impact on backups
- [ ] Backup format changed
- [ ] Restore compatibility maintained

## Testing

### How Has This Been Tested?

- [x] Unit tests
- [ ] Integration tests
- [x] Manual testing
- [x] Tested with SonarQube analysis

### Test Steps

1.  **Check for Updates:** Go to Settings -> Updates and click "Check for updates". Verify the spinner appears and the result (up to date or new version) is displayed.
2.  **View Release Notes:** Click "View Release Notes". Verify the dialog opens immediately and the markdown content is rendered correctly.
3.  **External Links:** Click on any link within the release notes or the "View Releases on GitHub" button. Verify the link opens in your default system browser, not inside the Electron app.
4.  **Auto-check:** Toggle the "Check for updates automatically" switch and verify the preference is saved (check LocalStorage or restart app).

### Test Configuration

- **Node version**: v20.x
- **npm version**: 10.x
- **Platform tested**: Windows 11

## UI Changes

### Before

_Previous update settings screen (simple buttons, no dialog for notes)._

### After

_New `OpenSettingsUpdatesComponent` with "Check for updates" card, "Current Version" display, and a dedicated `UpdateDialogComponent` for viewing formatted release notes._

## Checklist

- [x] My code follows the project's coding standards
- [x] I have performed a self-review of my code
- [x] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [x] My changes generate no new warnings or errors
- [x] I have added tests that prove my fix is effective or that my feature works
- [x] New and existing unit tests pass locally with my changes
- [x] I have run `npm run lint` and fixed any issues
- [x] I have run `npm test` and all tests pass
- [x] I have run `npm run test:electron` and all tests pass
- [x] I have run `npm run sonar:check` and the analysis passes
- [ ] Any dependent changes have been merged and published

## Breaking Changes

- [ ] This PR contains breaking changes

## Related Issues

Closes # (Add issue number if applicable)

## Additional Context

The unit test failures were caused by a mismatch between the `UpdateService` implementation (which uses Signals like `lastChecked`) and the mock objects used in tests, which were missing these properties. This PR aligns the mocks with the actual service implementation.

## Reviewer Notes

Please focus on the `preload.ts` changes regarding `openExternal` to ensure no security regressions were introduced, and verify that the `NgZone` fix in `OpenSettingsUpdatesComponent` effectively solves the dialog visibility issue on all platforms.
