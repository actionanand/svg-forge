import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SvgService } from '../../services/svg.service';

@Component({
  selector: 'app-svg-preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="preview-container">
      <div class="preview-toolbar">
        <span class="preview-label">Preview</span>
        <div class="zoom-controls">
          <button
            class="btn-zoom"
            (click)="zoomOut()"
            aria-label="Zoom out"
            [disabled]="zoom() <= 25"
          >
            −
          </button>
          <span class="zoom-value">{{ zoom() }}%</span>
          <button
            class="btn-zoom"
            (click)="zoomIn()"
            aria-label="Zoom in"
            [disabled]="zoom() >= 400"
          >
            +
          </button>
          <button class="btn-zoom" (click)="resetZoom()" aria-label="Reset zoom">⟲</button>
        </div>
        <div class="bg-toggles">
          <button
            class="bg-btn"
            [class.active]="bg() === 'checkerboard'"
            (click)="bg.set('checkerboard')"
            title="Checkerboard background"
            aria-label="Checkerboard background"
          >
            ▦
          </button>
          <button
            class="bg-btn"
            [class.active]="bg() === 'white'"
            (click)="bg.set('white')"
            title="White background"
            aria-label="White background"
          >
            ◻
          </button>
          <button
            class="bg-btn"
            [class.active]="bg() === 'dark'"
            (click)="bg.set('dark')"
            title="Dark background"
            aria-label="Dark background"
          >
            ◼
          </button>
        </div>
      </div>
      <div class="preview-area" [class]="'bg-' + bg()">
        @if (safeSvg()) {
          <div class="svg-wrapper" [style.zoom]="zoom() / 100" [innerHTML]="safeSvg()"></div>
        } @else {
          <div class="placeholder">
            <span>Paste or upload SVG code to preview</span>
          </div>
        }
      </div>
    </div>
  `,
  styleUrl: './svg-preview.scss',
})
export class SvgPreview {
  private readonly svgService = inject(SvgService);
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly zoom = signal(100);
  protected readonly bg = signal<'checkerboard' | 'white' | 'dark'>('checkerboard');

  protected readonly safeSvg = computed(() => {
    const code = this.svgService.svgCode();
    if (!code.trim()) return null;
    return this.sanitizer.bypassSecurityTrustHtml(code);
  });

  protected zoomIn(): void {
    this.zoom.update((z) => Math.min(400, z + 25));
  }

  protected zoomOut(): void {
    this.zoom.update((z) => Math.max(25, z - 25));
  }

  protected resetZoom(): void {
    this.zoom.set(100);
  }
}
