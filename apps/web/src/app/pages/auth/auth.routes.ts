import { Route } from '@angular/router';

export const authRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./auth.page').then((page) => page.AuthPage),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'login' },
      {
        path: 'login',
        loadComponent: () => import('./login/login.component').then((page) => page.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () => import('./register/register.component').then((page) => page.RegisterComponent),
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./forgot-password/forgot-password.component').then((page) => page.ForgotPasswordComponent),
      },
      {
        path: 'verify-email',
        loadComponent: () => import('./verify-email/verify-email.component').then((page) => page.VerifyEmailComponent),
      },
    ],
  },
];
