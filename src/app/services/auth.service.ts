import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser$ = new BehaviorSubject<User | null>(null);
  private users$ = new BehaviorSubject<User[]>([]);
  private isAuthenticated$ = new BehaviorSubject<boolean>(false);
  private nextUserId = 1;

  private readonly USERS_STORAGE_KEY = 'renthub_users';
  private readonly CURRENT_USER_STORAGE_KEY = 'renthub_currentUser';
  private readonly NEXT_ID_STORAGE_KEY = 'renthub_nextUserId';

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Get the current authenticated user
   */
  getCurrentUser(): Observable<User | null> {
    return this.currentUser$.asObservable();
  }

  /**
   * Get current user synchronously (useful in guards)
   */
  getCurrentUserSync(): User | null {
    return this.currentUser$.value;
  }

  /**
   * Get authentication status
   */
  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticated$.asObservable();
  }

  /**
   * Check if user is authenticated synchronously
   */
  isAuthenticatedSync(): boolean {
    return this.isAuthenticated$.value;
  }

  /**
   * Login with email and password
   */
  login(email: string, password: string): boolean {
    const user = this.users$.value.find(u => u.email === email && u.password === password);

    if (!user) {
      return false;
    }

    this.currentUser$.next(user);
    this.isAuthenticated$.next(true);
    this.saveCurrentUserToStorage(user);
    return true;
  }

  /**
   * Register a new user
   */
  register(name: string, email: string, password: string): boolean {
    // Check if email already exists
    if (this.users$.value.some(u => u.email === email)) {
      return false;
    }

    const newUser: User = {
      id: this.nextUserId++,
      name,
      email,
      password,
      createdAt: new Date()
    };

    const users = this.users$.value;
    users.push(newUser);
    this.users$.next(users);
    this.saveUsersToStorage();
    this.saveNextIdToStorage();
    return true;
  }

  /**
   * Logout the current user
   */
  logout(): void {
    this.currentUser$.next(null);
    this.isAuthenticated$.next(false);
    this.clearCurrentUserStorage();
  }

  /**
   * Get all users (for testing/debugging)
   */
  getAllUsers(): Observable<User[]> {
    return this.users$.asObservable();
  }

  /**
   * Get user by ID
   */
  getUserById(userId: number): User | undefined {
    return this.users$.value.find(u => u.id === userId);
  }

  private loadFromStorage(): void {
    try {
      const usersJson = localStorage.getItem(this.USERS_STORAGE_KEY);
      const currentUserJson = localStorage.getItem(this.CURRENT_USER_STORAGE_KEY);
      const nextIdJson = localStorage.getItem(this.NEXT_ID_STORAGE_KEY);

      if (usersJson) {
        this.users$.next(JSON.parse(usersJson));
      }

      if (nextIdJson) {
        this.nextUserId = JSON.parse(nextIdJson);
      }

      if (currentUserJson) {
        const currentUser = JSON.parse(currentUserJson);
        this.currentUser$.next(currentUser);
        this.isAuthenticated$.next(true);
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
    }
  }

  private saveUsersToStorage(): void {
    try {
      localStorage.setItem(this.USERS_STORAGE_KEY, JSON.stringify(this.users$.value));
    } catch (error) {
      console.error('Error saving users to storage:', error);
    }
  }

  private saveCurrentUserToStorage(user: User): void {
    try {
      localStorage.setItem(this.CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving current user to storage:', error);
    }
  }

  private clearCurrentUserStorage(): void {
    try {
      localStorage.removeItem(this.CURRENT_USER_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing current user storage:', error);
    }
  }

  private saveNextIdToStorage(): void {
    try {
      localStorage.setItem(this.NEXT_ID_STORAGE_KEY, JSON.stringify(this.nextUserId));
    } catch (error) {
      console.error('Error saving next ID to storage:', error);
    }
  }
}
