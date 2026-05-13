import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { SvgService } from '../../services/svg.service';

type OutputTab = 'preview' | 'react' | 'angular' | 'png' | 'dataurl';
type DataUrlType = 'minified' | 'base64' | 'uri';

@Component({
  selector: 'app-output-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="output-panel">
      <div class="tab-bar" role="tablist">
        @for (tab of tabs; track tab.id) {
          <button
            class="tab-btn"
            [class.active]="activeTab() === tab.id"
            (click)="activeTab.set(tab.id)"
            [attr.aria-selected]="activeTab() === tab.id"
            role="tab"
          >
            {{ tab.label }}
          </button>
        }
      </div>

      <div class="tab-content" role="tabpanel">
        @switch (activeTab()) {
          @case ('preview') {
            <div class="code-output">
              <div class="output-header">
                <span>SVG Code</span>
                <button class="btn-copy" (click)="copySvg()">
                  {{ copied() ? '✓ Copied' : '📋 Copy' }}
                </button>
              </div>
              <pre class="code-block"><code>{{ svgService.svgCode() }}</code></pre>
            </div>
          }
          @case ('react') {
            <div class="code-output">
              <div class="output-header">
                <span>React JSX Component</span>
                <button class="btn-copy" (click)="copyReact()">
                  {{ copied() ? '✓ Copied' : '📋 Copy' }}
                </button>
              </div>
              <pre class="code-block"><code>{{ reactCode() }}</code></pre>
            </div>
          }
          @case ('angular') {
            <div class="code-output">
              <div class="output-header">
                <span>Angular Component</span>
                <button class="btn-copy" (click)="copyAngular()">
                  {{ copied() ? '✓ Copied' : '📋 Copy' }}
                </button>
              </div>
              <pre class="code-block"><code>{{ angularCode() }}</code></pre>
            </div>
          }
          @case ('png') {
            <div class="png-output">
              <div class="output-header">
                <span>PNG Export</span>
                <button class="btn-copy btn-download" (click)="downloadPng()">
                  ⬇ Download PNG
                </button>
              </div>
              <div class="png-preview">
                @if (pngUrl()) {
                  <img [src]="pngUrl()" alt="PNG preview" />
                } @else {
                  <button class="btn-generate" (click)="generatePng()">Generate PNG Preview</button>
                }
              </div>
            </div>
          }
          @case ('dataurl') {
            <div class="code-output">
              <div class="output-header">
                <div class="dataurl-tabs">
                  <button
                    class="sub-tab"
                    [class.active]="dataUrlType() === 'minified'"
                    (click)="dataUrlType.set('minified')"
                  >
                    Minified
                  </button>
                  <button
                    class="sub-tab"
                    [class.active]="dataUrlType() === 'base64'"
                    (click)="dataUrlType.set('base64')"
                  >
                    Base64
                  </button>
                  <button
                    class="sub-tab"
                    [class.active]="dataUrlType() === 'uri'"
                    (click)="dataUrlType.set('uri')"
                  >
                    encodeURIComponent
                  </button>
                </div>
                <button class="btn-copy" (click)="copyDataUrl()">
                  {{ copied() ? '✓ Copied' : '📋 Copy' }}
                </button>
              </div>
              <pre class="code-block data-url-block"><code>{{ dataUrl() }}</code></pre>
            </div>
          }
        }
      </div>
    </div>
  `,
  styleUrl: './output-panel.scss',
})
export class OutputPanel {
  protected readonly svgService = inject(SvgService);
  protected readonly activeTab = signal<OutputTab>('preview');
  protected readonly dataUrlType = signal<DataUrlType>('minified');
  protected readonly copied = signal(false);
  protected readonly pngUrl = signal<string | null>(null);

  protected readonly tabs: { id: OutputTab; label: string }[] = [
    { id: 'preview', label: 'Preview' },
    { id: 'react', label: 'React' },
    { id: 'angular', label: 'Angular' },
    { id: 'png', label: 'PNG' },
    { id: 'dataurl', label: 'Data URI' },
  ];

  protected readonly reactCode = computed(() =>
    this.svgService.generateReactCode(this.svgService.svgCode()),
  );

  protected readonly angularCode = computed(() =>
    this.svgService.generateAngularCode(this.svgService.svgCode()),
  );

  protected readonly dataUrl = computed(() =>
    this.svgService.svgToDataUrl(this.svgService.svgCode(), this.dataUrlType()),
  );

  private flashCopied(): void {
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }

  protected copySvg(): void {
    this.svgService.copyToClipboard(this.svgService.svgCode());
    this.flashCopied();
  }

  protected copyReact(): void {
    this.svgService.copyToClipboard(this.reactCode());
    this.flashCopied();
  }

  protected copyAngular(): void {
    this.svgService.copyToClipboard(this.angularCode());
    this.flashCopied();
  }

  protected copyDataUrl(): void {
    this.svgService.copyToClipboard(this.dataUrl());
    this.flashCopied();
  }

  protected async downloadPng(): Promise<void> {
    await this.svgService.downloadPng(this.svgService.svgCode());
  }

  protected async generatePng(): Promise<void> {
    const blob = await this.svgService.svgToPngBlob(this.svgService.svgCode());
    this.pngUrl.set(URL.createObjectURL(blob));
  }
}
