import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SvgService } from '../../services/svg.service';
import { SnackbarService } from '../../services/snackbar.service';

@Component({
  selector: 'app-toolbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="toolbar">
      <div class="toolbar-brand">
        <span class="brand-icon">SF</span>
        <span class="brand-name">SVGForge</span>
      </div>
      <nav class="toolbar-nav" aria-label="Primary">
        <a class="toolbar-link active" routerLink="/" aria-current="page">SVG Editor</a>
        <a class="toolbar-link" routerLink="/android-vector-drawable"> Android Vector Drawable </a>
      </nav>
      <div class="toolbar-actions">
        <button class="toolbar-btn" (click)="onDownloadSvg()" title="Download SVG">
          <span class="btn-icon">SVG</span>
          <span class="btn-text">Download SVG</span>
        </button>
        <button class="toolbar-btn" (click)="onDownloadPng()" title="Download PNG">
          <span class="btn-icon">PNG</span>
          <span class="btn-text">Download PNG</span>
        </button>
        <button class="toolbar-btn btn-primary" (click)="onCopySvg()" title="Copy SVG code">
          <span class="btn-icon">Copy</span>
          <span class="btn-text">Copy SVG</span>
        </button>
      </div>
    </div>
  `,
  styleUrl: './toolbar.scss',
})
export class Toolbar {
  private readonly svgService = inject(SvgService);
  private readonly snackbar = inject(SnackbarService);

  protected onDownloadSvg(): void {
    this.svgService.downloadSvg(this.svgService.svgCode());
    this.snackbar.show('SVG downloaded');
  }

  protected async onDownloadPng(): Promise<void> {
    await this.svgService.downloadPng(this.svgService.svgCode());
    this.snackbar.show('PNG downloaded');
  }

  protected onCopySvg(): void {
    this.svgService.copyToClipboard(this.svgService.svgCode());
    this.snackbar.show('SVG code copied to clipboard');
  }
}
