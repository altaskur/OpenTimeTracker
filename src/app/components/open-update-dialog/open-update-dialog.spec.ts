import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { OpenUpdateDialogComponent } from './open-update-dialog';
import { UpdateInfo } from '../../../types/electron';

describe('OpenUpdateDialogComponent', () => {
  let component: OpenUpdateDialogComponent;
  let fixture: ComponentFixture<OpenUpdateDialogComponent>;

  const mockUpdateInfo: UpdateInfo = {
    version: '2.0.0',
    releaseName: 'Major Update',
    releaseNotes: 'New features and improvements',
    releaseDate: '2026-02-01T00:00:00Z',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpenUpdateDialogComponent, TranslateModule.forRoot()],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(OpenUpdateDialogComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('visible', false);
    expect(component).toBeTruthy();
  });

  describe('dialogHeader computed', () => {
    it('should return availableTitle when not downloading and not downloaded', () => {
      fixture.componentRef.setInput('visible', true);
      fixture.componentRef.setInput('isDownloading', false);
      fixture.componentRef.setInput('isDownloaded', false);

      expect(component.dialogHeader()).toBe('update.availableTitle');
    });

    it('should return downloadingTitle when downloading', () => {
      fixture.componentRef.setInput('visible', true);
      fixture.componentRef.setInput('isDownloading', true);
      fixture.componentRef.setInput('isDownloaded', false);

      expect(component.dialogHeader()).toBe('update.downloadingTitle');
    });

    it('should return readyToInstallTitle when downloaded', () => {
      fixture.componentRef.setInput('visible', true);
      fixture.componentRef.setInput('isDownloading', false);
      fixture.componentRef.setInput('isDownloaded', true);

      expect(component.dialogHeader()).toBe('update.readyToInstallTitle');
    });
  });

  describe('output events', () => {
    it('should emit download event when onDownload is called', () => {
      fixture.componentRef.setInput('visible', true);
      let emitted = false;
      component.download.subscribe(() => {
        emitted = true;
      });

      component.onDownload();

      expect(emitted).toBe(true);
    });

    it('should emit install event when onInstall is called', () => {
      fixture.componentRef.setInput('visible', true);
      let emitted = false;
      component.install.subscribe(() => {
        emitted = true;
      });

      component.onInstall();

      expect(emitted).toBe(true);
    });

    it('should emit closed event when onClose is called', () => {
      fixture.componentRef.setInput('visible', true);
      let emitted = false;
      component.closed.subscribe(() => {
        emitted = true;
      });

      component.onClose();

      expect(emitted).toBe(true);
    });
  });

  describe('rendering', () => {
    it('should display update info when provided', () => {
      fixture.componentRef.setInput('visible', true);
      fixture.componentRef.setInput('updateInfo', mockUpdateInfo);
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('2.0.0');
    });

    it('should display progress bar when downloading', () => {
      fixture.componentRef.setInput('visible', true);
      fixture.componentRef.setInput('isDownloading', true);
      fixture.componentRef.setInput('downloadProgress', 50);
      fixture.detectChanges();

      const progressBar = fixture.nativeElement.querySelector('p-progressBar');
      expect(progressBar).toBeTruthy();
    });

    it('should show download button when not downloading and not downloaded', () => {
      fixture.componentRef.setInput('visible', true);
      fixture.componentRef.setInput('isDownloading', false);
      fixture.componentRef.setInput('isDownloaded', false);
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('p-button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should show install button when downloaded', () => {
      fixture.componentRef.setInput('visible', true);
      fixture.componentRef.setInput('isDownloading', false);
      fixture.componentRef.setInput('isDownloaded', true);
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('p-button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should show disabled button when downloading in progress', () => {
      fixture.componentRef.setInput('visible', true);
      fixture.componentRef.setInput('isDownloading', true);
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('p-button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('inputs', () => {
    it('should accept visible input', () => {
      fixture.componentRef.setInput('visible', true);
      expect(component.visible()).toBe(true);

      fixture.componentRef.setInput('visible', false);
      expect(component.visible()).toBe(false);
    });

    it('should accept updateInfo input', () => {
      fixture.componentRef.setInput('visible', true);
      fixture.componentRef.setInput('updateInfo', mockUpdateInfo);
      expect(component.updateInfo()).toEqual(mockUpdateInfo);
    });

    it('should accept downloadProgress input', () => {
      fixture.componentRef.setInput('visible', true);
      fixture.componentRef.setInput('downloadProgress', 75);
      expect(component.downloadProgress()).toBe(75);
    });

    it('should accept isDownloading input', () => {
      fixture.componentRef.setInput('visible', true);
      fixture.componentRef.setInput('isDownloading', true);
      expect(component.isDownloading()).toBe(true);
    });

    it('should accept isDownloaded input', () => {
      fixture.componentRef.setInput('visible', true);
      fixture.componentRef.setInput('isDownloaded', true);
      expect(component.isDownloaded()).toBe(true);
    });

    it('should handle null updateInfo', () => {
      fixture.componentRef.setInput('visible', true);
      fixture.componentRef.setInput('updateInfo', null);
      expect(component.updateInfo()).toBeNull();
    });
  });

  describe('dialog states', () => {
    it('should handle initial state (available update)', () => {
      fixture.componentRef.setInput('visible', true);
      fixture.componentRef.setInput('updateInfo', mockUpdateInfo);
      fixture.componentRef.setInput('isDownloading', false);
      fixture.componentRef.setInput('isDownloaded', false);
      fixture.detectChanges();

      expect(component.dialogHeader()).toBe('update.availableTitle');
      expect(component.visible()).toBe(true);
    });

    it('should handle downloading state', () => {
      fixture.componentRef.setInput('visible', true);
      fixture.componentRef.setInput('updateInfo', mockUpdateInfo);
      fixture.componentRef.setInput('isDownloading', true);
      fixture.componentRef.setInput('isDownloaded', false);
      fixture.componentRef.setInput('downloadProgress', 30);
      fixture.detectChanges();

      expect(component.dialogHeader()).toBe('update.downloadingTitle');
      expect(component.downloadProgress()).toBe(30);
    });

    it('should handle downloaded state', () => {
      fixture.componentRef.setInput('visible', true);
      fixture.componentRef.setInput('updateInfo', mockUpdateInfo);
      fixture.componentRef.setInput('isDownloading', false);
      fixture.componentRef.setInput('isDownloaded', true);
      fixture.componentRef.setInput('downloadProgress', 100);
      fixture.detectChanges();

      expect(component.dialogHeader()).toBe('update.readyToInstallTitle');
      expect(component.isDownloaded()).toBe(true);
    });
  });
});
