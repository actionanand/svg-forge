import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SvgService, SvgoSettings } from '../../services/svg.service';

interface SettingItem {
  key: keyof SvgoSettings;
  label: string;
}

@Component({
  selector: 'app-settings-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="settings-panel">
      <div class="settings-header">
        <h3>Optimization Settings</h3>
        <button class="btn-reset" (click)="onReset()" title="Reset to defaults">Reset</button>
      </div>
      <div class="settings-list" role="list">
        @for (item of settingItems; track item.key) {
          <label class="setting-item" role="listitem">
            <input
              type="checkbox"
              [ngModel]="svgService.settings()[item.key]"
              (ngModelChange)="svgService.updateSetting(item.key, $event)"
            />
            <span class="setting-label">{{ item.label }}</span>
          </label>
        }
      </div>
    </div>
  `,
  styleUrl: './settings-panel.scss',
})
export class SettingsPanel {
  protected readonly svgService = inject(SvgService);

  protected readonly settingItems: SettingItem[] = [
    { key: 'cleanupAttrs', label: 'Cleanup attributes' },
    { key: 'removeComments', label: 'Remove comments' },
    { key: 'removeScripts', label: 'Remove scripts' },
    { key: 'convertColorsToRgb', label: 'Convert colors to RGB' },
    { key: 'inlineStyles', label: 'Inline styles' },
    { key: 'mergeStyles', label: 'Merge styles' },
    { key: 'removeViewBox', label: 'Remove viewBox' },
    { key: 'removeDimensions', label: 'Remove dimensions' },
    { key: 'removeEmptyAttrs', label: 'Remove empty attributes' },
    { key: 'removeHiddenElems', label: 'Remove hidden elements' },
    { key: 'removeEmptyText', label: 'Remove empty text' },
    { key: 'removeEmptyContainers', label: 'Remove empty containers' },
    { key: 'cleanupIds', label: 'Cleanup IDs' },
    { key: 'removeUselessDefs', label: 'Remove useless defs' },
    { key: 'removeMetadata', label: 'Remove metadata' },
    { key: 'removeTitle', label: 'Remove title' },
    { key: 'removeDesc', label: 'Remove desc' },
    { key: 'removeEditorsNSData', label: 'Remove editor namespace data' },
    { key: 'sortAttrs', label: 'Sort attributes' },
    { key: 'convertPathData', label: 'Convert path data' },
    { key: 'convertTransform', label: 'Convert transforms' },
    { key: 'removeUnknownsAndDefaults', label: 'Remove unknowns & defaults' },
    { key: 'removeUselessStrokeAndFill', label: 'Remove useless stroke & fill' },
    { key: 'cleanupNumericValues', label: 'Cleanup numeric values' },
    { key: 'collapseGroups', label: 'Collapse groups' },
    { key: 'mergePaths', label: 'Merge paths' },
    { key: 'convertShapeToPath', label: 'Convert shapes to paths' },
    { key: 'minifyStyles', label: 'Minify styles' },
  ];

  protected onReset(): void {
    this.svgService.resetSettings();
  }
}
