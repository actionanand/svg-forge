import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SvgService } from '../../services/svg.service';
import { SVG_GALLERY, SvgIconEntry } from '../../svg-icons/svg-gallery';

@Component({
  selector: 'app-svg-gallery',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="gallery-panel">
      <div class="gallery-header">
        <h3>SVG Gallery</h3>
      </div>
      <div class="search-box">
        <input
          type="search"
          placeholder="Search SVGs..."
          [ngModel]="searchTerm()"
          (ngModelChange)="searchTerm.set($event)"
          aria-label="Search SVG icons"
        />
      </div>
      <div class="gallery-grid" role="list">
        @for (icon of filteredIcons(); track icon.name) {
          <button
            class="icon-card"
            (click)="selectIcon(icon)"
            [title]="icon.name"
            role="listitem"
            [attr.aria-label]="'Select ' + icon.name + ' SVG'"
          >
            <div class="icon-preview" [innerHTML]="icon.svg"></div>
            <span class="icon-name">{{ icon.name }}</span>
          </button>
        }
        @if (filteredIcons().length === 0) {
          <div class="no-results">No SVGs found</div>
        }
      </div>
    </div>
  `,
  styleUrl: './svg-gallery.scss',
})
export class SvgGallery {
  private readonly svgService = inject(SvgService);
  protected readonly searchTerm = signal('');

  private readonly allIcons = SVG_GALLERY;

  protected readonly filteredIcons = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.allIcons;
    return this.allIcons.filter(
      (icon) => icon.name.includes(term) || icon.category.toLowerCase().includes(term),
    );
  });

  protected selectIcon(icon: SvgIconEntry): void {
    this.svgService.setSvgCode(icon.svg);
  }
}
