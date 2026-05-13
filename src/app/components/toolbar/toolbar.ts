import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { SvgService } from '../../services/svg.service';

@Component({
  selector: 'app-toolbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toolbar">
      <div class="toolbar-brand">
        <span class="brand-icon">⚒️</span>
        <span class="brand-name">SVGForge</span>
      </div>
      <div class="toolbar-actions">
        <button class="toolbar-btn" (click)="onDownloadSvg()" title="Download SVG">
          <span class="btn-icon">⬇</span>
          <span class="btn-text">Download SVG</span>
        </button>
        <button class="toolbar-btn" (click)="onDownloadPng()" title="Download PNG">
          <span class="btn-icon">🖼</span>
          <span class="btn-text">Download PNG</span>
        </button>
        <button class="toolbar-btn btn-primary" (click)="onCopySvg()" title="Copy SVG code">
          <span class="btn-icon">📋</span>
          <span class="btn-text">Copy SVG</span>
        </button>
      </div>
    </div>
  `,
  styleUrl: './toolbar.scss',
})
export class Toolbar {
  private readonly svgService = inject(SvgService);

  protected onDownloadSvg(): void {
    this.svgService.downloadSvg(this.svgService.svgCode());
  }

  protected async onDownloadPng(): Promise<void> {
    await this.svgService.downloadPng(this.svgService.svgCode());
  }

  protected onCopySvg(): void {
    this.svgService.copyToClipboard(this.svgService.svgCode());
  }
}
