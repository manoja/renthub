import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Property } from '../../models/property';
import { Favorite } from '../../models/favorite';
import { PropertyService } from '../../services/property.service';
import { FavoriteService } from '../../services/favorite.service';

interface User {
  id: number;
  name: string;
  email: string;
}

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.scss'
})
export class FavoritesComponent implements OnInit {
  @Input() currentUser: User | null = null;
  @Output() viewProperty = new EventEmitter<string>();
  @Output() back = new EventEmitter<void>();

  favorites: Favorite[] = [];
  favoriteProperties: Map<string, Property> = new Map();
  loading: boolean = true;

  constructor(
    private favoriteService: FavoriteService,
    private propertyService: PropertyService
  ) {}

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    if (!this.currentUser) {
      this.loading = false;
      return;
    }

    this.loading = true;
    this.favorites = this.favoriteService.getUserFavorites(this.currentUser.id);
    
    // Load properties for each favorite
    this.favoriteProperties.clear();
    this.favorites.forEach(favorite => {
      const property = this.propertyService.getPropertyById(favorite.propertyId);
      if (property) {
        this.favoriteProperties.set(favorite.propertyId, property);
      }
    });

    this.loading = false;
  }

  removeFavorite(propertyId: string): void {
    if (this.currentUser) {
      this.favoriteService.removeFavorite(propertyId, this.currentUser.id);
      this.loadFavorites();
    }
  }

  onViewProperty(propertyId: string): void {
    this.viewProperty.emit(propertyId);
  }

  onBack(): void {
    this.back.emit();
  }

  getPropertyDetails(propertyId: string): Property | undefined {
    return this.favoriteProperties.get(propertyId);
  }
}
