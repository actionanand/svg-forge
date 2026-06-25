import { Injectable } from '@angular/core';

export interface AndroidVectorDrawableResult {
  svg: string;
  error: string | null;
}

interface ColorParts {
  color: string;
  opacity: string | null;
}

@Injectable({ providedIn: 'root' })
export class AndroidVectorDrawableService {
  convert(xml: string): AndroidVectorDrawableResult {
    const trimmed = xml.trim();
    if (!trimmed) {
      return { svg: '', error: null };
    }

    const doc = new DOMParser().parseFromString(trimmed, 'application/xml');
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      return { svg: '', error: 'The Android VectorDrawable XML could not be parsed.' };
    }

    const vector = doc.documentElement;
    if (!vector || vector.localName !== 'vector') {
      return { svg: '', error: 'The XML must start with an Android <vector> element.' };
    }

    const viewportWidth = this.attr(vector, 'viewportWidth') || '24';
    const viewportHeight = this.attr(vector, 'viewportHeight') || '24';
    const width = this.dimension(this.attr(vector, 'width')) || viewportWidth;
    const height = this.dimension(this.attr(vector, 'height')) || viewportHeight;
    const body = this.childrenToSvg(vector, 1);

    const svg = [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${this.escapeAttr(width)}" height="${this.escapeAttr(
        height,
      )}" viewBox="0 0 ${this.escapeAttr(viewportWidth)} ${this.escapeAttr(viewportHeight)}">`,
      body || '  <path d="" fill="none"/>',
      '</svg>',
    ].join('\n');

    return { svg, error: null };
  }

  private childrenToSvg(element: Element, depth: number): string {
    const lines: string[] = [];

    for (const child of Array.from(element.children)) {
      if (child.localName === 'path') {
        lines.push(this.pathToSvg(child, depth));
      }

      if (child.localName === 'clip-path') {
        lines.push(this.clipPathToSvg(child, depth));
      }

      if (child.localName === 'group') {
        const children = this.childrenToSvg(child, depth + 1);
        if (children) {
          const transform = this.groupTransform(child);
          const transformAttr = transform ? ` transform="${this.escapeAttr(transform)}"` : '';
          lines.push(`${this.indent(depth)}<g${transformAttr}>`);
          lines.push(children);
          lines.push(`${this.indent(depth)}</g>`);
        }
      }
    }

    return lines.join('\n');
  }

  private pathToSvg(path: Element, depth: number): string {
    const attrs: string[] = [];
    const pathData = this.attr(path, 'pathData') || '';
    attrs.push(`d="${this.escapeAttr(pathData)}"`);

    const fill = this.color(this.attr(path, 'fillColor'));
    if (fill) {
      attrs.push(`fill="${this.escapeAttr(fill.color)}"`);
      const fillAlpha = this.alpha(this.attr(path, 'fillAlpha'), fill.opacity);
      if (fillAlpha) {
        attrs.push(`fill-opacity="${fillAlpha}"`);
      }
    } else {
      attrs.push('fill="none"');
    }

    const stroke = this.color(this.attr(path, 'strokeColor'));
    if (stroke) {
      attrs.push(`stroke="${this.escapeAttr(stroke.color)}"`);
      const strokeAlpha = this.alpha(this.attr(path, 'strokeAlpha'), stroke.opacity);
      if (strokeAlpha) {
        attrs.push(`stroke-opacity="${strokeAlpha}"`);
      }
    }

    this.addOptionalAttr(attrs, 'stroke-width', this.attr(path, 'strokeWidth'));
    this.addOptionalAttr(attrs, 'stroke-linecap', this.attr(path, 'strokeLineCap'));
    this.addOptionalAttr(attrs, 'stroke-linejoin', this.attr(path, 'strokeLineJoin'));
    this.addOptionalAttr(attrs, 'stroke-miterlimit', this.attr(path, 'strokeMiterLimit'));

    const fillType = this.attr(path, 'fillType');
    if (fillType) {
      attrs.push(`fill-rule="${fillType === 'evenOdd' ? 'evenodd' : 'nonzero'}"`);
    }

    return `${this.indent(depth)}<path ${attrs.join(' ')}/>`;
  }

  private clipPathToSvg(path: Element, depth: number): string {
    const pathData = this.attr(path, 'pathData') || '';
    return `${this.indent(depth)}<clipPath><path d="${this.escapeAttr(pathData)}"/></clipPath>`;
  }

  private groupTransform(group: Element): string {
    const transforms: string[] = [];
    const translateX = this.attr(group, 'translateX');
    const translateY = this.attr(group, 'translateY');
    const rotation = this.attr(group, 'rotation');
    const pivotX = this.attr(group, 'pivotX') || '0';
    const pivotY = this.attr(group, 'pivotY') || '0';
    const scaleX = this.attr(group, 'scaleX');
    const scaleY = this.attr(group, 'scaleY');

    if (translateX || translateY) {
      transforms.push(`translate(${translateX || '0'} ${translateY || '0'})`);
    }

    if (rotation) {
      transforms.push(`rotate(${rotation} ${pivotX} ${pivotY})`);
    }

    if (scaleX || scaleY) {
      transforms.push(`scale(${scaleX || '1'} ${scaleY || scaleX || '1'})`);
    }

    return transforms.join(' ');
  }

  private addOptionalAttr(attrs: string[], svgName: string, value: string | null): void {
    if (value) {
      attrs.push(`${svgName}="${this.escapeAttr(value)}"`);
    }
  }

  private attr(element: Element, name: string): string | null {
    return (
      element.getAttribute(`android:${name}`) ||
      element.getAttributeNS('http://schemas.android.com/apk/res/android', name) ||
      element.getAttribute(name)
    );
  }

  private dimension(value: string | null): string | null {
    if (!value) {
      return null;
    }

    return value.replace(/(?:dp|sp|px)$/i, '');
  }

  private color(value: string | null): ColorParts | null {
    if (!value) {
      return null;
    }

    if (value === '@android:color/transparent' || value === '@color/transparent') {
      return { color: 'transparent', opacity: null };
    }

    if (!value.startsWith('#')) {
      return { color: 'currentColor', opacity: null };
    }

    const hex = value.slice(1);
    if (hex.length === 8) {
      return {
        color: `#${hex.slice(2)}`,
        opacity: this.hexAlpha(hex.slice(0, 2)),
      };
    }

    if (hex.length === 4) {
      return {
        color: `#${hex.slice(1)}`,
        opacity: this.hexAlpha(hex[0] + hex[0]),
      };
    }

    return { color: value, opacity: null };
  }

  private alpha(explicitAlpha: string | null, colorAlpha: string | null): string | null {
    return explicitAlpha || colorAlpha;
  }

  private hexAlpha(hex: string): string {
    const alpha = parseInt(hex, 16) / 255;
    return Number(alpha.toFixed(3)).toString();
  }

  private escapeAttr(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  private indent(depth: number): string {
    return '  '.repeat(depth);
  }
}
