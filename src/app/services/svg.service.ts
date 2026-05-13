import { Injectable, signal, computed } from '@angular/core';

export interface SvgoSettings {
  cleanupAttrs: boolean;
  removeComments: boolean;
  removeScripts: boolean;
  convertColorsToRgb: boolean;
  inlineStyles: boolean;
  mergeStyles: boolean;
  removeViewBox: boolean;
  removeDimensions: boolean;
  removeEmptyAttrs: boolean;
  removeHiddenElems: boolean;
  removeEmptyText: boolean;
  removeEmptyContainers: boolean;
  cleanupIds: boolean;
  removeUselessDefs: boolean;
  removeMetadata: boolean;
  removeTitle: boolean;
  removeDesc: boolean;
  removeEditorsNSData: boolean;
  sortAttrs: boolean;
  convertPathData: boolean;
  convertTransform: boolean;
  removeUnknownsAndDefaults: boolean;
  removeUselessStrokeAndFill: boolean;
  cleanupNumericValues: boolean;
  collapseGroups: boolean;
  mergePaths: boolean;
  convertShapeToPath: boolean;
  minifyStyles: boolean;
}

const DEFAULT_SETTINGS: SvgoSettings = {
  cleanupAttrs: true,
  removeComments: true,
  removeScripts: false,
  convertColorsToRgb: false,
  inlineStyles: true,
  mergeStyles: true,
  removeViewBox: false,
  removeDimensions: false,
  removeEmptyAttrs: true,
  removeHiddenElems: true,
  removeEmptyText: true,
  removeEmptyContainers: true,
  cleanupIds: true,
  removeUselessDefs: true,
  removeMetadata: true,
  removeTitle: true,
  removeDesc: true,
  removeEditorsNSData: true,
  sortAttrs: false,
  convertPathData: true,
  convertTransform: true,
  removeUnknownsAndDefaults: true,
  removeUselessStrokeAndFill: true,
  cleanupNumericValues: true,
  collapseGroups: true,
  mergePaths: true,
  convertShapeToPath: false,
  minifyStyles: true,
};

@Injectable({ providedIn: 'root' })
export class SvgService {
  readonly svgCode = signal(
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <rect width="200" height="200" rx="20" fill="#6366F1"/>
  <circle cx="100" cy="80" r="30" fill="white"/>
  <text x="100" y="150" text-anchor="middle" font-size="24" fill="white" font-family="sans-serif">SVGForge</text>
</svg>`,
  );

  readonly settings = signal<SvgoSettings>({ ...DEFAULT_SETTINGS });

  readonly originalSize = computed(() => new Blob([this.svgCode()]).size);

  getDefaultSettings(): SvgoSettings {
    return { ...DEFAULT_SETTINGS };
  }

  setSvgCode(code: string): void {
    this.svgCode.set(code);
  }

  updateSetting<K extends keyof SvgoSettings>(key: K, value: SvgoSettings[K]): void {
    this.settings.update((s) => ({ ...s, [key]: value }));
  }

  resetSettings(): void {
    this.settings.set({ ...DEFAULT_SETTINGS });
  }

  prettify(svg: string): string {
    let indent = 0;
    const tab = '  ';
    const lines: string[] = [];

    // Normalize whitespace
    svg = svg.replace(/>\s+</g, '><').trim();

    // Split by tags
    const tokens = svg.match(/(<[^>]+>)|([^<]+)/g) || [];

    for (const token of tokens) {
      const trimmed = token.trim();
      if (!trimmed) continue;

      if (trimmed.startsWith('</')) {
        indent = Math.max(0, indent - 1);
        lines.push(tab.repeat(indent) + trimmed);
      } else if (
        trimmed.startsWith('<') &&
        !trimmed.endsWith('/>') &&
        !trimmed.startsWith('<?') &&
        !trimmed.startsWith('<!')
      ) {
        lines.push(tab.repeat(indent) + trimmed);
        indent++;
      } else {
        lines.push(tab.repeat(indent) + trimmed);
      }
    }

    return lines.join('\n');
  }

  optimizeSvg(svg: string): { result: string; savings: number } {
    let result = svg;
    const settings = this.settings();

    if (settings.removeComments) {
      result = result.replace(/<!--[\s\S]*?-->/g, '');
    }
    if (settings.removeScripts) {
      result = result.replace(/<script[\s\S]*?<\/script>/gi, '');
    }
    if (settings.removeMetadata) {
      result = result.replace(/<metadata[\s\S]*?<\/metadata>/gi, '');
    }
    if (settings.removeTitle) {
      result = result.replace(/<title[\s\S]*?<\/title>/gi, '');
    }
    if (settings.removeDesc) {
      result = result.replace(/<desc[\s\S]*?<\/desc>/gi, '');
    }
    if (settings.removeEditorsNSData) {
      result = result.replace(/\s+xmlns:(sketch|inkscape|sodipodi|dc|cc|rdf)="[^"]*"/g, '');
      result = result.replace(/\s+(sketch|inkscape|sodipodi):[a-zA-Z-]+="[^"]*"/g, '');
    }
    if (settings.removeEmptyAttrs) {
      result = result.replace(/\s+[a-zA-Z-]+=""/g, '');
    }
    if (settings.cleanupAttrs) {
      result = result.replace(/\s{2,}/g, ' ');
    }
    if (settings.removeEmptyContainers) {
      result = result.replace(/<g>\s*<\/g>/g, '');
      result = result.replace(/<defs>\s*<\/defs>/g, '');
    }
    if (settings.removeEmptyText) {
      result = result.replace(/<text[^>]*>\s*<\/text>/g, '');
    }
    if (settings.convertColorsToRgb) {
      result = result.replace(/#([0-9a-fA-F]{6})\b/g, (_, hex) => {
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return `rgb(${r},${g},${b})`;
      });
    }
    if (settings.cleanupNumericValues) {
      result = result.replace(/(\d+)\.0+([" ,\s<>])/g, '$1$2');
    }
    if (settings.removeViewBox) {
      result = result.replace(/\s+viewBox="[^"]*"/g, '');
    }
    if (settings.removeDimensions) {
      result = result.replace(/\s+(width|height)="[^"]*"/g, '');
    }

    // Minify whitespace
    result = result.replace(/>\s+</g, '><').trim();

    const originalSize = new Blob([svg]).size;
    const newSize = new Blob([result]).size;
    const savings =
      originalSize > 0 ? Math.round(((originalSize - newSize) / originalSize) * 100) : 0;

    return { result, savings };
  }

  generateReactCode(svg: string): string {
    let jsx = svg
      .replace(/class=/g, 'className=')
      .replace(/clip-path=/g, 'clipPath=')
      .replace(/fill-rule=/g, 'fillRule=')
      .replace(/clip-rule=/g, 'clipRule=')
      .replace(/stroke-width=/g, 'strokeWidth=')
      .replace(/stroke-linecap=/g, 'strokeLinecap=')
      .replace(/stroke-linejoin=/g, 'strokeLinejoin=')
      .replace(/stroke-dasharray=/g, 'strokeDasharray=')
      .replace(/stroke-dashoffset=/g, 'strokeDashoffset=')
      .replace(/stroke-miterlimit=/g, 'strokeMiterlimit=')
      .replace(/stroke-opacity=/g, 'strokeOpacity=')
      .replace(/fill-opacity=/g, 'fillOpacity=')
      .replace(/font-family=/g, 'fontFamily=')
      .replace(/font-size=/g, 'fontSize=')
      .replace(/font-weight=/g, 'fontWeight=')
      .replace(/text-anchor=/g, 'textAnchor=')
      .replace(/text-decoration=/g, 'textDecoration=')
      .replace(/xmlns:xlink=/g, 'xmlnsXlink=')
      .replace(/xml:space=/g, 'xmlSpace=');

    return `const SvgIcon = (props) => (\n  ${jsx.replace('<svg', '<svg {...props}')}\n);\n\nexport default SvgIcon;`;
  }

  generateAngularCode(svg: string): string {
    return `import { Component } from '@angular/core';

@Component({
  selector: 'app-svg-icon',
  template: \`
    ${svg}
  \`,
})
export class SvgIconComponent {}`;
  }

  svgToDataUrl(svg: string, encoding: 'minified' | 'base64' | 'uri'): string {
    switch (encoding) {
      case 'base64':
        return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
      case 'uri':
        return 'data:image/svg+xml,' + encodeURIComponent(svg);
      case 'minified': {
        const minified = svg
          .replace(/>\s+</g, '><')
          .replace(/\s{2,}/g, ' ')
          .trim();
        return 'data:image/svg+xml,' + encodeURIComponent(minified);
      }
    }
  }

  svgToPngBlob(svg: string, scale = 2): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Cannot get canvas context'));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Cannot create PNG blob'));
        }, 'image/png');
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load SVG'));
      };
      img.src = url;
    });
  }

  downloadSvg(svg: string, filename = 'image.svg'): void {
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    this.downloadBlob(blob, filename);
  }

  async downloadPng(svg: string, filename = 'image.png'): Promise<void> {
    const blob = await this.svgToPngBlob(svg);
    this.downloadBlob(blob, filename);
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  copyToClipboard(text: string): Promise<void> {
    return navigator.clipboard.writeText(text);
  }
}
