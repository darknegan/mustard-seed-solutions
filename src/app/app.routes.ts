import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home').then((m) => m.Home),
    title: 'Mustard Seed Solutions — Websites that earn trust and generate real leads',
  },
  {
    path: 'solutions',
    loadComponent: () => import('./solutions/solutions-page').then((m) => m.SolutionsPageComponent),
    title: 'Solutions & pricing — Mustard Seed Solutions',
  },
  {
    path: 'process',
    loadComponent: () => import('./process/process-page').then((m) => m.ProcessPageComponent),
    title: 'How we work — Mustard Seed Solutions',
  },
  {
    path: 'about',
    loadComponent: () => import('./about/about-page').then((m) => m.AboutPageComponent),
    title: 'About — Mustard Seed Solutions',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
