import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Favorite } from '../models/favorite';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private favorites$ = new BehaviorSubject<Favorite[]>([]);
  private readonly storageKey = 'renthub_favorites';

  constructor() {
    this.loadFromStorage();
  }

  getFavorites(): Observable<Favorite[]> {
    return this.favorites$.asObservable();
  }

  getUserFavorites(userId: number): Favorite[] {
    return this.favorites$.value.filter(f => f.userId === userId);
  }

  isFavorite(propertyId: string, userId: number): boolean {
    return this.favorites$.value.some(f => 
      f.propertyId === propertyId && f.userId === userId
    );
  }

  addFavorite(propertyId: string, userId: number): Favorite {
    // Avoid duplicates
    if (this.isFavorite(propertyId, userId)) {
      return this.favorites$.value.find(f => 
        f.propertyId === propertyId && f.userId === userId
      )!;
    }

    const favorite: Favorite = {
      propertyId,
      userId,
      addedAt: new Date()
    };

    const current = this.favorites$.value;
    this.favorites$.next([...current, favorite]);
    this.saveToStorage();

    return favorite;
  }

  removeFavorite(propertyId: string, userId: number): boolean {
    const current = this.favorites$.value;
    const filtered = current.filter(f => 
      !(f.propertyId === propertyId && f.userId === userId)
    );

    if (filtered.length < current.length) {
      this.favorites$.next(filtered);
      this.saveToStorage();
      return true;
    }

    return false;
  }

  private saveToStorage(): void {
    const favorites = this.favorites$.value;
    localStorage.setItem(this.storageKey, JSON.stringify(favorites));
  }

  private loadFromStorage(): void {
    const stored = localStorage.getItem(this.storageKey);

    if (stored) {
      const favorites = JSON.parse(stored).map((f: any) => ({
        ...f,
        addedAt: new Date(f.addedAt)
      }));
      this.favorites$.next(favorites);
    }
  }
}
