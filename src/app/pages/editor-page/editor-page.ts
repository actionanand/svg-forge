import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { Toolbar } from '../../components/toolbar/toolbar';
import { CodeEditor } from '../../components/code-editor/code-editor';
import { SvgPreview } from '../../components/svg-preview/svg-preview';
import { SettingsPanel } from '../../components/settings-panel/settings-panel';
import { OutputPanel } from '../../components/output-panel/output-panel';
import { SvgGallery } from '../../components/svg-gallery/svg-gallery';
import { Snackbar } from '../../components/snackbar/snackbar';

@Component({
  selector: 'app-editor-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Toolbar, CodeEditor, SvgPreview, SettingsPanel, OutputPanel, SvgGallery, Snackbar],
  templateUrl: './editor-page.html',
  styleUrl: './editor-page.scss',
})
export class EditorPage {
  protected readonly showGallery = signal(true);
  protected readonly showSettings = signal(false);
  protected readonly outputCollapsed = signal(false);

  protected toggleGallery(): void {
    this.showGallery.update((v) => !v);
  }

  protected toggleSettings(): void {
    this.showSettings.update((v) => !v);
  }

  protected toggleOutput(): void {
    this.outputCollapsed.update((v) => !v);
  }
}
