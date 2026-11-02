import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PropertyFormComponent } from './components/property-form/property-form.component';
import { PropertyDetailsComponent } from './components/property-details/property-details.component';
import { FavoritesComponent } from './components/favorites/favorites.component';
import { ProfileComponent } from './components/profile/profile.component';
import { PropertyListingComponent } from './components/property-listing/property-listing.component';
import { PropertyFormData } from './models/property';
import { User } from './models/user';
import { PropertyService } from './services/property.service';
import { AuthService } from './services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    FormsModule,
    PropertyFormComponent,
    PropertyDetailsComponent,
    FavoritesComponent,
    ProfileComponent,
    PropertyListingComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {
  protected readonly appTitle = 'RentHub';

  // Navigation State
  protected currentPage: 'home' | 'listings' | 'details' | 'favorites' | 'profile' | 'create' | 'edit' =
    'listings';
  protected selectedPropertyId: string | null = null;
  protected editingPropertyId: string | null = null;

  // Authentication State
  protected isAuthenticated: boolean = false;
  protected currentUser: User | null = null;

  // Auth Modal State
  protected isAuthModalOpen: boolean = false;
  protected authMode: 'login' | 'register' = 'login';
  protected returnUrl: string | null = null;

  // Login Form Data
  protected loginEmail: string = '';
  protected loginPassword: string = '';
  protected loginError: string = '';

  // Register Form Data
  protected registerName: string = '';
  protected registerEmail: string = '';
  protected registerPassword: string = '';
  protected registerConfirmPassword: string = '';
  protected registerError: string = '';
  protected registerSuccess: string = '';

  private destroy$ = new Subject<void>();

  constructor(
    private propertyService: PropertyService,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Subscribe to authentication state from AuthService
    this.authService.isAuthenticated()
      .pipe(takeUntil(this.destroy$))
      .subscribe(isAuthenticated => {
        this.isAuthenticated = isAuthenticated;
      });

    this.authService.getCurrentUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });

    // Sync with router navigation using NavigationEnd events
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        const fullUrl = this.router.url.split('?')[0]; // Remove query params
        const path = fullUrl.substring(1) || ''; // Remove leading slash
        this.updatePageFromRoute(path);
      });

    // Handle query parameters for login redirect
    this.activatedRoute.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.returnUrl = params['returnUrl'] || null;
      });

    // Set initial page based on current route
    const fullUrl = this.router.url.split('?')[0];
    const path = fullUrl.substring(1) || '';
    this.updatePageFromRoute(path);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updatePageFromRoute(path: string): void {
    if (!path || path === '' || path === 'home') {
      this.currentPage = 'home';
      this.isAuthModalOpen = false;
    } else if (path === 'listings') {
      this.currentPage = 'listings';
      this.isAuthModalOpen = false;
    } else if (path === 'login') {
      // For login, show the modal but keep a default page in background
      this.currentPage = 'listings';
      this.openAuthModal('login');
    } else if (path === 'create') {
      this.currentPage = 'create';
      this.isAuthModalOpen = false;
    } else if (path === 'profile') {
      this.currentPage = 'profile';
      this.isAuthModalOpen = false;
    } else if (path === 'favorites') {
      this.currentPage = 'favorites';
      this.isAuthModalOpen = false;
    } else if (path === 'edit') {
      this.currentPage = 'edit';
      this.isAuthModalOpen = false;
    } else if (path.startsWith('property/')) {
      this.currentPage = 'details';
      this.isAuthModalOpen = false;
      const id = path.split('/')[1];
      if (id) {
        this.selectedPropertyId = id;
      }
    } else {
      this.currentPage = 'home';
      this.isAuthModalOpen = false;
    }
  }

  protected openAuthModal(mode: 'login' | 'register'): void {
    this.authMode = mode;
    this.isAuthModalOpen = true;
    this.clearFormErrors();
    this.resetForms();
  }

  protected closeAuthModal(): void {
    this.isAuthModalOpen = false;
    this.resetForms();
    this.clearFormErrors();
  }

  protected switchAuthMode(mode: 'login' | 'register'): void {
    this.authMode = mode;
    this.resetForms();
    this.clearFormErrors();
  }

  protected handleLogin(): void {
    this.loginError = '';

    if (!this.validateLoginForm()) {
      return;
    }

    // Use AuthService to login
    const success = this.authService.login(this.loginEmail, this.loginPassword);

    if (!success) {
      this.loginError = 'Invalid email or password';
      return;
    }

    this.closeAuthModal();

    // Redirect to returnUrl or home
    if (this.returnUrl) {
      this.router.navigateByUrl(this.returnUrl);
    } else {
      this.router.navigate(['/']);
    }
  }

  protected handleRegister(): void {
    this.registerError = '';
    this.registerSuccess = '';

    if (!this.validateRegisterForm()) {
      return;
    }

    if (this.registerPassword !== this.registerConfirmPassword) {
      this.registerError = 'Passwords do not match';
      return;
    }

    // Use AuthService to register
    const success = this.authService.register(
      this.registerName,
      this.registerEmail,
      this.registerPassword
    );

    if (!success) {
      this.registerError = 'Email already registered';
      return;
    }

    this.registerSuccess = 'Account created successfully! Please login.';

    setTimeout(() => {
      this.switchAuthMode('login');
      this.registerSuccess = '';
    }, 2000);
  }

  protected handleLogout(): void {
    this.authService.logout();
    this.resetForms();
    this.router.navigate(['/']);
  }

  private validateLoginForm(): boolean {
    if (!this.loginEmail.trim()) {
      this.loginError = 'Email is required';
      return false;
    }

    if (!this.isValidEmail(this.loginEmail)) {
      this.loginError = 'Invalid email format';
      return false;
    }

    if (!this.loginPassword.trim()) {
      this.loginError = 'Password is required';
      return false;
    }

    return true;
  }

  private validateRegisterForm(): boolean {
    if (!this.registerName.trim()) {
      this.registerError = 'Name is required';
      return false;
    }

    if (this.registerName.trim().length < 2) {
      this.registerError = 'Name must be at least 2 characters';
      return false;
    }

    if (!this.registerEmail.trim()) {
      this.registerError = 'Email is required';
      return false;
    }

    if (!this.isValidEmail(this.registerEmail)) {
      this.registerError = 'Invalid email format';
      return false;
    }

    if (!this.registerPassword.trim()) {
      this.registerError = 'Password is required';
      return false;
    }

    if (this.registerPassword.length < 6) {
      this.registerError = 'Password must be at least 6 characters';
      return false;
    }

    if (!this.registerConfirmPassword.trim()) {
      this.registerError = 'Please confirm your password';
      return false;
    }

    return true;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private resetForms(): void {
    this.loginEmail = '';
    this.loginPassword = '';
    this.registerName = '';
    this.registerEmail = '';
    this.registerPassword = '';
    this.registerConfirmPassword = '';
  }

  private clearFormErrors(): void {
    this.loginError = '';
    this.registerError = '';
    this.registerSuccess = '';
  }

  // Navigation Methods
  protected goHome(): void {
    this.router.navigate(['/']);
  }

  protected goToListings(): void {
    this.router.navigate(['/listings']);
  }

  protected goToProfile(): void {
    if (!this.isAuthenticated) {
      this.openAuthModal('login');
      return;
    }
    this.router.navigate(['/profile']);
  }

  protected goToCreateListing(): void {
    if (!this.isAuthenticated) {
      this.openAuthModal('login');
      return;
    }
    this.editingPropertyId = null;
    this.router.navigate(['/create']);
  }

  protected goToEditListing(propertyId: string): void {
    if (!this.isAuthenticated) {
      this.openAuthModal('login');
      return;
    }
    this.editingPropertyId = propertyId;
    this.router.navigate(['/edit', propertyId]);
  }

  protected getEditingProperty() {
    if (this.editingPropertyId) {
      return this.propertyService.getPropertyById(this.editingPropertyId);
    }
    return null;
  }

  protected goToPropertyDetails(propertyId: string): void {
    this.router.navigate(['/property', propertyId]);
  }

  protected goToFavorites(): void {
    if (!this.isAuthenticated) {
      this.openAuthModal('login');
      return;
    }
    this.router.navigate(['/favorites']);
  }

  protected handlePropertySubmit(formData: PropertyFormData): void {
    console.log('📨 handlePropertySubmit() received event');
    console.log('Event type:', typeof formData);
    console.log('Event keys:', Object.keys(formData));
    console.log('Full event:', formData);
    
    // Check if this is a native DOM event instead of emitted data
    if (formData && formData.hasOwnProperty('isTrusted')) {
      console.log('⚠️  WARNING: Received native DOM event instead of form data!');
      console.log('This suggests the form submit event is being intercepted.');
      return;
    }

    console.log('Current user:', this.currentUser);
    console.log('Current page:', this.currentPage);
    console.log('Form data:', JSON.stringify(formData, null, 2));

    if (!this.currentUser) {
      console.log('❌ No current user! Aborting submission');
      return;
    }

    if (this.currentPage === 'create') {
      console.log('📝 Creating new property for user:', this.currentUser.id);
      const property = this.propertyService.createProperty(formData as any, this.currentUser.id);
      if (property === null) {
        console.log('❌ Property creation failed (quota exceeded)');
        return; // Don't navigate on failure
      }
      console.log('✅ Property created:', property);
      this.router.navigate(['/profile']);
    } else if (this.currentPage === 'edit' && this.editingPropertyId) {
      console.log('✏️ Updating property:', this.editingPropertyId);
      const updated = this.propertyService.updateProperty(this.editingPropertyId, formData as any, this.currentUser.id);
      console.log('✅ Property updated:', updated);
      this.editingPropertyId = null;
      this.router.navigate(['/profile']);
    } else {
      console.log('❌ Invalid page state for property submission');
    }
  }

  protected handlePropertyFormCancel(): void {
    this.editingPropertyId = null;
    if (this.currentPage === 'create') {
      this.router.navigate(['/']);
    } else if (this.currentPage === 'edit') {
      this.router.navigate(['/profile']);
    }
  }
}
