import * as Icons from './icons';

export interface SvgIconEntry {
  name: string;
  svg: string;
  category: string;
}

const categorize = (category: string, entries: [string, string][]): SvgIconEntry[] =>
  entries.map(([key, svg]) => ({
    name: key.replace(/^SVG_/, '').replace(/_/g, ' ').toLowerCase(),
    svg,
    category,
  }));

const extract = (mod: Record<string, string>, prefix: string): [string, string][] =>
  Object.entries(mod).filter(([k]) => k.startsWith(prefix)) as [string, string][];

import * as Shapes from './icons/shapes';
import * as Weather from './icons/weather';
import * as Common from './icons/common';
import * as Nature from './icons/nature';
import * as Emoji from './icons/emoji';

export const SVG_GALLERY: SvgIconEntry[] = [
  ...categorize('Shapes', extract(Shapes, 'SVG_')),
  ...categorize('Weather', extract(Weather, 'SVG_')),
  ...categorize('Common', extract(Common, 'SVG_')),
  ...categorize('Nature', extract(Nature, 'SVG_')),
  ...categorize('Emoji', extract(Emoji, 'SVG_')),
];

export { Icons };
