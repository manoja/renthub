import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PropertyService } from '../services/property.service';

/**
 * Functional owner guard that verifies the current user is the property owner
 * Used for editing and deleting properties
 * Only allows property owners to access these routes
 */
export const ownerGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const propertyService = inject(PropertyService);
  const router = inject(Router);

  // First check if user is authenticated
  if (!authService.isAuthenticatedSync()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Get the property ID from route parameters
  const propertyId = route.params['id'];
  if (!propertyId) {
    router.navigate(['/']);
    return false;
  }

  // Get the property
  const property = propertyService.getPropertyById(propertyId);
  if (!property) {
    router.navigate(['/']);
    return false;
  }

  // Get the current user
  const currentUser = authService.getCurrentUserSync();
  if (!currentUser) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Check if current user is the property owner
  if (property.ownerId !== currentUser.id) {
    // User is not the owner, redirect to home
    router.navigate(['/']);
    return false;
  }

  return true;
};
