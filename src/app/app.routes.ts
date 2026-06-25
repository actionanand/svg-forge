import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/editor-page/editor-page').then((m) => m.EditorPage),
  },
  {
    path: 'android-vector-drawable',
    loadComponent: () =>
      import('./pages/android-vector-page/android-vector-page').then((m) => m.AndroidVectorPage),
  },
];
