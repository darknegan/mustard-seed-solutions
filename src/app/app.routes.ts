import { Routes } from '@angular/router';

import { AboutPageComponent } from './about/about-page';
import { Home } from './home/home';
import { ProcessPageComponent } from './process/process-page';
import { SolutionsPageComponent } from './solutions/solutions-page';

// Eager top-level routes so each navigation resolves synchronously (no lazy-chunk delay).
export const routes: Routes = [
  {
    path: '',
    component: Home,
    title: 'Mustard Seed Solutions — Websites that earn trust and generate real leads',
  },
  {
    path: 'solutions',
    component: SolutionsPageComponent,
    title: 'Solutions & pricing — Mustard Seed Solutions',
  },
  {
    path: 'process',
    component: ProcessPageComponent,
    title: 'How we work — Mustard Seed Solutions',
  },
  {
    path: 'about',
    component: AboutPageComponent,
    title: 'About — Mustard Seed Solutions',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
