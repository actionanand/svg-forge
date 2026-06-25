import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { AndroidVectorDrawableService } from '../../services/android-vector-drawable.service';
import { Snackbar } from '../../components/snackbar/snackbar';
import { SnackbarService } from '../../services/snackbar.service';
import { SvgService } from '../../services/svg.service';

interface AndroidVectorExample {
  name: string;
  description: string;
  xml: string;
}

interface AndroidVectorExampleCard extends AndroidVectorExample {
  preview: SafeHtml | null;
}

const DEFAULT_ANDROID_VECTOR = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
    <path
        android:fillColor="#FFFFFFFF"
        android:pathData="M4,20h16v2H4zM5,13h4v6H5zM10,8h4v11h-4zM15,4h4v15h-4z" />
</vector>`;

const EXAMPLES: AndroidVectorExample[] = [
  {
    name: 'Bar chart',
    description: 'Filled bars with alpha color',
    xml: DEFAULT_ANDROID_VECTOR,
  },
  {
    name: 'Star',
    description: 'Single filled path',
    xml: `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
    <path
        android:fillColor="#FFFFC107"
        android:pathData="M12,2l3.09,6.26L22,9.27l-5,4.87L18.18,21L12,17.77L5.82,21L7,14.14L2,9.27l6.91,-1.01z" />
</vector>`,
  },
  {
    name: 'Heart',
    description: 'Material-style rounded icon',
    xml: `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
    <path
        android:fillColor="#FFE91E63"
        android:pathData="M12,21.35l-1.45,-1.32C5.4,15.36 2,12.28 2,8.5C2,5.42 4.42,3 7.5,3c1.74,0 3.41,0.81 4.5,2.09C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.42 22,8.5c0,3.78 -3.4,6.86 -8.55,11.54z" />
</vector>`,
  },
  {
    name: 'Stroke check',
    description: 'Stroke-only icon',
    xml: `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
    <path
        android:fillColor="@android:color/transparent"
        android:strokeColor="#FF22C55E"
        android:strokeWidth="2"
        android:strokeLineCap="round"
        android:strokeLineJoin="round"
        android:pathData="M4,12.5l5,5L20,6.5" />
</vector>`,
  },
];

@Component({
  selector: 'app-android-vector-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Snackbar],
  templateUrl: './android-vector-page.html',
  styleUrl: './android-vector-page.scss',
})
export class AndroidVectorPage {
  private readonly converter = inject(AndroidVectorDrawableService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly snackbar = inject(SnackbarService);
  private readonly svgService = inject(SvgService);
  private readonly router = inject(Router);

  protected readonly examples: AndroidVectorExampleCard[] = EXAMPLES.map((example) => {
    const { svg } = this.converter.convert(example.xml);
    return {
      ...example,
      preview: svg ? this.sanitizer.bypassSecurityTrustHtml(svg) : null,
    };
  });
  protected readonly xml = signal(DEFAULT_ANDROID_VECTOR);
  protected readonly copied = signal(false);
  protected readonly conversion = computed(() => this.converter.convert(this.xml()));
  protected readonly svg = computed(() => this.conversion().svg);
  protected readonly safeSvg = computed(() => {
    const svg = this.svg();
    return svg ? this.sanitizer.bypassSecurityTrustHtml(svg) : null;
  });
  protected readonly lineCount = computed(() => this.xml().split('\n').length);
  protected readonly charCount = computed(() => new Blob([this.xml()]).size);

  protected onXmlInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.xml.set(textarea.value);
  }

  protected onFileUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.xml.set(String(reader.result || ''));
      this.snackbar.show(`Loaded: ${file.name}`);
    };
    reader.readAsText(file);
    input.value = '';
  }

  protected useExample(example: AndroidVectorExample): void {
    this.xml.set(example.xml);
    this.snackbar.show(`${example.name} example loaded`);
  }

  protected clearXml(): void {
    this.xml.set('');
    this.snackbar.show('Android vector XML cleared', 'info');
  }

  protected copySvg(): void {
    if (!this.svg()) {
      return;
    }

    this.svgService.copyToClipboard(this.svg());
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
    this.snackbar.show('Converted SVG copied');
  }

  protected downloadSvg(): void {
    if (!this.svg()) {
      return;
    }

    this.svgService.downloadSvg(this.svg(), 'android-vector.svg');
    this.snackbar.show('Converted SVG downloaded');
  }

  protected sendToSvgEditor(): void {
    if (!this.svg()) {
      return;
    }

    this.svgService.setSvgCode(this.svg());
    this.snackbar.show('Converted SVG sent to the SVG editor');
    void this.router.navigate(['/']);
  }
}
