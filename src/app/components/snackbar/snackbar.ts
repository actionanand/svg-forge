import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { SnackbarService } from '../../services/snackbar.service';

const TOAST_ICONS: Record<string, string> = {
  success: '✓',
  info: 'ℹ',
  error: '✕',
};

@Component({
  selector: 'app-snackbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="snackbar-container" aria-live="polite" aria-atomic="false">
      @for (toast of snackbarService.toasts(); track toast.id) {
        <div class="toast" [class]="'toast-' + toast.type" role="status">
          <span class="toast-icon" aria-hidden="true">{{ icons[toast.type] }}</span>
          <span class="toast-message">{{ toast.message }}</span>
          <button
            class="toast-close"
            (click)="snackbarService.dismiss(toast.id)"
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      }
    </div>
  `,
  styleUrl: './snackbar.scss',
})
export class Snackbar {
  protected readonly snackbarService = inject(SnackbarService);
  protected readonly icons = TOAST_ICONS;
}
