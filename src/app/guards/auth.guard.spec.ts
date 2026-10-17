import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { authGuard } from './auth.guard';
import { ownerGuard } from './owner.guard';
import { AuthService } from '../services/auth.service';
import { PropertyService } from '../services/property.service';
import { User } from '../models/user';

describe('authGuard', () => {
  let router: Router;
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService, PropertyService]
    });
    router = TestBed.inject(Router);
    authService = TestBed.inject(AuthService);

    spyOn(router, 'navigate');
  });

  it('should allow authenticated users to access the route', () => {
    // Setup: Create and login a user
    authService.register('Test User', 'test@example.com', 'password123');
    authService.login('test@example.com', 'password123');

    // Create mock route and state
    const mockRoute = {} as ActivatedRouteSnapshot;
    const mockState = { url: '/profile' } as RouterStateSnapshot;

    // Execute within injection context
    const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

    // Assert
    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should redirect unauthenticated users to /login', () => {
    // Setup: Ensure user is not authenticated
    authService.logout();

    // Create mock route and state
    const mockRoute = {} as ActivatedRouteSnapshot;
    const mockState = { url: '/profile' } as RouterStateSnapshot;

    // Execute within injection context
    const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

    // Assert
    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/profile' }
    });
  });

  it('should preserve the return URL when redirecting to login', () => {
    // Setup: Ensure user is not authenticated
    authService.logout();

    // Create mock route and state with specific URL
    const mockRoute = {} as ActivatedRouteSnapshot;
    const mockState = { url: '/favorites' } as RouterStateSnapshot;

    // Execute within injection context
    TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

    // Assert
    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/favorites' }
    });
  });
});

describe('ownerGuard', () => {
  let router: Router;
  let authService: AuthService;
  let propertyService: PropertyService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService, PropertyService]
    });
    router = TestBed.inject(Router);
    authService = TestBed.inject(AuthService);
    propertyService = TestBed.inject(PropertyService);

    spyOn(router, 'navigate');
  });

  it('should allow property owner to access the route', () => {
    // Setup: Create and login a user
    authService.register('Owner User', 'owner@example.com', 'password123');
    authService.login('owner@example.com', 'password123');

    const currentUser = authService.getCurrentUserSync();
    expect(currentUser).toBeTruthy();

    // Create a property owned by the current user
    propertyService.createProperty(
      {
        propertyType: 'Apartment',
        buildingName: 'Test Building',
        sharedStatus: false,
        address: '123 Main St',
        city: 'Test City',
        state: 'TS',
        area: 1000,
        expectedRent: 1000,
        negotiable: false,
        leaseType: 'LongTerm',
        priceMode: 'Monthly',
        furnishedStatus: 'Furnished',
        vegetarianPreference: false,
        amenities: [],
        title: 'Test Property',
        description: 'Test Description',
        landlordName: currentUser!.name,
        landlordEmail: currentUser!.email,
        landlordPreference: 'Any',
        landlordPhone: '1234567890',
        photos: []
      },
      currentUser!.id
    );

    const properties = propertyService['properties$'].value;
    const propertyId = properties[0].id;

    // Create mock route with property ID and state
    const mockRoute = { params: { id: propertyId } } as any;
    const mockState = { url: '/edit/' + propertyId } as RouterStateSnapshot;

    // Execute within injection context
    const result = TestBed.runInInjectionContext(() => ownerGuard(mockRoute, mockState));

    // Assert
    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should redirect unauthenticated users to /login', () => {
    // Setup: Ensure user is not authenticated
    authService.logout();

    // Create mock route and state
    const mockRoute = { params: { id: 'prop_1' } } as any;
    const mockState = { url: '/edit/prop_1' } as RouterStateSnapshot;

    // Execute within injection context
    const result = TestBed.runInInjectionContext(() => ownerGuard(mockRoute, mockState));

    // Assert
    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/edit/prop_1' }
    });
  });

  it('should redirect non-owner users to home', () => {
    // Setup: Create and login first user as property owner
    authService.register('Owner', 'owner@example.com', 'password123');
    authService.login('owner@example.com', 'password123');

    const owner = authService.getCurrentUserSync();
    expect(owner).toBeTruthy();

    // Create a property
    propertyService.createProperty(
      {
        propertyType: 'Apartment',
        buildingName: 'Test Building',
        sharedStatus: false,
        address: '123 Main St',
        city: 'Test City',
        state: 'TS',
        area: 1000,
        expectedRent: 1000,
        negotiable: false,
        leaseType: 'LongTerm',
        priceMode: 'Monthly',
        furnishedStatus: 'Furnished',
        vegetarianPreference: false,
        amenities: [],
        title: 'Test Property',
        description: 'Test Description',
        landlordName: owner!.name,
        landlordEmail: owner!.email,
        landlordPreference: 'Any',
        landlordPhone: '1234567890',
        photos: []
      },
      owner!.id
    );

    const properties = propertyService['properties$'].value;
    const propertyId = properties[0].id;

    // Logout and login as different user
    authService.logout();
    authService.register('Other User', 'other@example.com', 'password123');
    authService.login('other@example.com', 'password123');

    // Create mock route and state
    const mockRoute = { params: { id: propertyId } } as any;
    const mockState = { url: '/edit/' + propertyId } as RouterStateSnapshot;

    // Execute within injection context
    const result = TestBed.runInInjectionContext(() => ownerGuard(mockRoute, mockState));

    // Assert
    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should redirect to home when property is not found', () => {
    // Setup: Create and login a user
    authService.register('Test User', 'test@example.com', 'password123');
    authService.login('test@example.com', 'password123');

    // Create mock route with non-existent property ID
    const mockRoute = { params: { id: 'non_existent_id' } } as any;
    const mockState = { url: '/edit/non_existent_id' } as RouterStateSnapshot;

    // Execute within injection context
    const result = TestBed.runInInjectionContext(() => ownerGuard(mockRoute, mockState));

    // Assert
    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should redirect to home when property ID is missing', () => {
    // Setup: Create and login a user
    authService.register('Test User', 'test@example.com', 'password123');
    authService.login('test@example.com', 'password123');

    // Create mock route without property ID
    const mockRoute = { params: {} } as any;
    const mockState = { url: '/edit' } as RouterStateSnapshot;

    // Execute within injection context
    const result = TestBed.runInInjectionContext(() => ownerGuard(mockRoute, mockState));

    // Assert
    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });
});
