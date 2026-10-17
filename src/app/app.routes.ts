import { Routes } from '@angular/router';
import { App } from './app';
import { authGuard } from './guards/auth.guard';
import { ownerGuard } from './guards/owner.guard';

/**
 * Application Routes with Angular 20 functional guards
 * 
 * Routes without authentication:
 * - / (home) - Browse all properties
 * - /listings - View property listings
 * - /property/:id - View property details
 * 
 * Routes requiring authentication (authGuard):
 * - /favorites - View saved favorite properties
 * - /profile - View user profile and owned properties
 * - /create - Create a new property listing
 * 
 * Routes requiring authentication + ownership verification (ownerGuard):
 * - /edit/:id - Edit a property (owner only)
 */
export const routes: Routes = [
  {
    path: '',
    component: App
  },
  {
    path: 'home',
    component: App
  },
  {
    path: 'listings',
    component: App
  },
  {
    path: 'property/:id',
    component: App
  },
  {
    path: 'login',
    component: App
  },
  {
    path: 'favorites',
    component: App,
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    component: App,
    canActivate: [authGuard]
  },
  {
    path: 'create',
    component: App,
    canActivate: [authGuard]
  },
  {
    path: 'edit/:id',
    component: App,
    canActivate: [ownerGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
