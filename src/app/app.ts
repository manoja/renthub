import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { PropertyFormComponent } from './components/property-form/property-form.component';
import { PropertyDetailsComponent } from './components/property-details/property-details.component';
import { FavoritesComponent } from './components/favorites/favorites.component';
import { ProfileComponent } from './components/profile/profile.component';
import { PropertyListingComponent } from './components/property-listing/property-listing.component';
import { PropertyFormData } from './models/property';
import { PropertyService } from './services/property.service';

interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    FormsModule,
    RouterOutlet,
    PropertyFormComponent,
    PropertyDetailsComponent,
    FavoritesComponent,
    ProfileComponent,
    PropertyListingComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly appTitle = 'RentHub';

  // Navigation State
  protected currentPage: 'home' | 'listings' | 'details' | 'favorites' | 'profile' | 'create' | 'edit' =
    'home';
  protected selectedPropertyId: string | null = null;
  protected editingPropertyId: string | null = null;

  // Authentication State
  protected isAuthenticated: boolean = false;
  protected currentUser: User | null = null;
  protected users: User[] = [];
  protected nextUserId: number = 1;

  // Auth Modal State
  protected isAuthModalOpen: boolean = false;
  protected authMode: 'login' | 'register' = 'login';

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

  constructor(private propertyService: PropertyService) {
    this.loadUsersFromStorage();
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

    const user = this.users.find(
      u => u.email === this.loginEmail && u.password === this.loginPassword
    );

    if (!user) {
      this.loginError = 'Invalid email or password';
      return;
    }

    this.currentUser = user;
    this.isAuthenticated = true;
    this.closeAuthModal();
  }

  protected handleRegister(): void {
    this.registerError = '';
    this.registerSuccess = '';

    if (!this.validateRegisterForm()) {
      return;
    }

    if (this.users.some(u => u.email === this.registerEmail)) {
      this.registerError = 'Email already registered';
      return;
    }

    if (this.registerPassword !== this.registerConfirmPassword) {
      this.registerError = 'Passwords do not match';
      return;
    }

    const newUser: User = {
      id: this.nextUserId++,
      name: this.registerName,
      email: this.registerEmail,
      password: this.registerPassword,
      createdAt: new Date()
    };

    this.users.push(newUser);
    this.saveUsersToStorage();
    this.registerSuccess = 'Account created successfully! Please login.';

    setTimeout(() => {
      this.switchAuthMode('login');
      this.registerSuccess = '';
    }, 2000);
  }

  protected handleLogout(): void {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.resetForms();
    this.currentPage = 'home';
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

  private saveUsersToStorage(): void {
    try {
      localStorage.setItem('renthub_users', JSON.stringify(this.users));
      localStorage.setItem('renthub_nextUserId', JSON.stringify(this.nextUserId));
    } catch (error) {
      console.error('Error saving users to storage:', error);
    }
  }

  private loadUsersFromStorage(): void {
    try {
      const usersJson = localStorage.getItem('renthub_users');
      const nextIdJson = localStorage.getItem('renthub_nextUserId');

      if (usersJson) {
        this.users = JSON.parse(usersJson);
      }
      if (nextIdJson) {
        this.nextUserId = JSON.parse(nextIdJson);
      }
    } catch (error) {
      console.error('Error loading users from storage:', error);
    }
  }

  // Navigation Methods
  protected goHome(): void {
    this.currentPage = 'home';
  }

  protected goToListings(): void {
    this.currentPage = 'listings';
  }

  protected goToProfile(): void {
    if (!this.isAuthenticated) {
      this.openAuthModal('login');
      return;
    }
    this.currentPage = 'profile';
  }

  protected goToCreateListing(): void {
    if (!this.isAuthenticated) {
      this.openAuthModal('login');
      return;
    }
    this.editingPropertyId = null;
    this.currentPage = 'create';
  }

  protected goToEditListing(propertyId: string): void {
    if (!this.isAuthenticated) {
      this.openAuthModal('login');
      return;
    }
    this.editingPropertyId = propertyId;
    this.currentPage = 'edit';
  }

  protected goToPropertyDetails(propertyId: string): void {
    this.selectedPropertyId = propertyId;
    this.currentPage = 'details';
  }

  protected goToFavorites(): void {
    if (!this.isAuthenticated) {
      this.openAuthModal('login');
      return;
    }
    this.currentPage = 'favorites';
  }

  protected handlePropertySubmit(formData: PropertyFormData): void {
    if (!this.currentUser) return;

    if (this.currentPage === 'create') {
      this.propertyService.createProperty(formData, this.currentUser.id);
      this.goToProfile();
    } else if (this.currentPage === 'edit' && this.editingPropertyId) {
      this.propertyService.updateProperty(this.editingPropertyId, formData, this.currentUser.id);
      this.editingPropertyId = null;
      this.goToProfile();
    }
  }

  protected handlePropertyFormCancel(): void {
    this.editingPropertyId = null;
    if (this.currentPage === 'create') {
      this.goHome();
    } else if (this.currentPage === 'edit') {
      this.goToProfile();
    }
  }
}
