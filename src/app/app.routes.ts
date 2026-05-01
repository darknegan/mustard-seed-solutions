import { Routes } from '@angular/router';

import { AboutPageComponent } from './about/about-page';
import { Home } from './home/home';
import { ProcessPageComponent } from './process/process-page';
import { SolutionsPageComponent } from './solutions/solutions-page';
import { redirectToDashboardIfLoggedInGuard } from './shared/guards/redirect-to-dashboard-if-logged-in.guard';
import { requireAuthGuard } from './shared/guards/require-auth.guard';

// Public marketing routes stay eager; portal routes are loaded only when clients need them.
export const routes: Routes = [
  {
    path: '',
    component: Home,
    canActivate: [redirectToDashboardIfLoggedInGuard],
    title:
      'Mustard Seed Solutions — Websites for shops, churches, nonprofits & teams that earn trust',
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
    path: 'login',
    loadComponent: () => import('./login/login-page').then((m) => m.LoginPageComponent),
    canActivate: [redirectToDashboardIfLoggedInGuard],
    title: 'Client sign in — Mustard Seed Solutions',
    data: { hideChrome: true },
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard-page').then((m) => m.DashboardPageComponent),
    canActivate: [requireAuthGuard],
    canActivateChild: [requireAuthGuard],
    title: 'Client dashboard — Mustard Seed Solutions',
    data: { hideChrome: true },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./dashboard/overview/dashboard-overview-page').then(
            (m) => m.DashboardOverviewPageComponent,
          ),
        title: 'Client dashboard — Mustard Seed Solutions',
        data: {
          portalTitle: 'Dashboard',
          portalGreeting: "Here's what's happening with your site today.",
        },
      },
      {
        path: 'documents',
        loadComponent: () =>
          import('./dashboard/documents/dashboard-documents-page').then(
            (m) => m.DashboardDocumentsPageComponent,
          ),
        title: 'My documents — Mustard Seed Solutions',
        data: {
          portalTitle: 'My Documents',
          portalGreeting: 'Your files are ready when you need them.',
        },
      },
      {
        path: 'request-change',
        loadComponent: () =>
          import('./dashboard/request-change/dashboard-request-change-page').then(
            (m) => m.DashboardRequestChangePageComponent,
          ),
        title: 'Request a change — Mustard Seed Solutions',
        data: {
          portalTitle: 'Request a Change',
          portalGreeting: 'Tell us what needs to be updated.',
        },
      },
      {
        path: 'report-issue',
        loadComponent: () =>
          import('./dashboard/report-issue/dashboard-report-issue-page').then(
            (m) => m.DashboardReportIssuePageComponent,
          ),
        title: 'Report an issue — Mustard Seed Solutions',
        data: {
          portalTitle: 'Report an Issue',
          portalGreeting: 'Tell us what broke so we can reproduce it quickly.',
        },
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
