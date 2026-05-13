import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  effect,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SvgService } from '../../services/svg.service';
import { SnackbarService } from '../../services/snackbar.service';

@Component({
  selector: 'app-code-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './code-editor.html',
  styleUrl: './code-editor.scss',
})
export class CodeEditor {
  private readonly svgService = inject(SvgService);
  private readonly snackbar = inject(SnackbarService);

  protected readonly code = signal(this.svgService.svgCode());
  protected readonly lineCount = computed(() => this.code().split('\n').length);
  protected readonly charCount = computed(() => new Blob([this.code()]).size);

  constructor() {
    effect(() => {
      const externalCode = this.svgService.svgCode();
      if (externalCode !== this.code()) {
        this.code.set(externalCode);
      }
    });
  }

  protected onCodeChange(value: string): void {
    this.code.set(value);
    this.svgService.setSvgCode(value);
  }

  protected onClear(): void {
    this.code.set('');
    this.svgService.setSvgCode('');
    this.snackbar.show('Editor cleared', 'info');
  }

  protected onOptimize(): void {
    const { result, savings } = this.svgService.optimizeSvg(this.code());
    this.code.set(result);
    this.svgService.setSvgCode(result);
    this.lastSavings.set(savings);
    this.showSavings.set(true);
    setTimeout(() => this.showSavings.set(false), 3000);
    this.snackbar.show(`Optimized — saved ${savings}%`);
  }

  protected onPrettify(): void {
    const result = this.svgService.prettify(this.code());
    this.code.set(result);
    this.svgService.setSvgCode(result);
    this.snackbar.show('SVG prettified');
  }

  protected readonly lastSavings = signal(0);
  protected readonly showSavings = signal(false);

  protected onFileUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      this.code.set(text);
      this.svgService.setSvgCode(text);
      this.snackbar.show(`Loaded: ${file.name}`);
    };
    reader.readAsText(file);
    input.value = '';
  }

  protected onPaste(): void {
    // let default paste behavior work in textarea
  }

  protected readonly lines = computed(() => {
    const count = this.lineCount();
    return Array.from({ length: count }, (_, i) => i + 1);
  });
}
