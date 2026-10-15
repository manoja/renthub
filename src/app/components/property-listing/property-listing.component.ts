import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Property } from '../../models/property';
import { PropertyService } from '../../services/property.service';
import { FavoriteService } from '../../services/favorite.service';

interface User {
  id: number;
  name: string;
  email: string;
}

@Component({
  selector: 'app-property-listing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './property-listing.component.html',
  styleUrl: './property-listing.component.scss'
})
export class PropertyListingComponent implements OnInit {
  @Input() currentUser: User | null = null;
  @Output() viewProperty = new EventEmitter<string>();

  allProperties: Property[] = [];
  filteredProperties: Property[] = [];
  searchQuery: string = '';
  selectedCity: string = '';
  selectedPropertyType: string = '';
  sortBy: string = 'recent';

  uniqueCities: string[] = [];
  propertyTypes: string[] = ['Apartment', 'House', 'Villa', 'Studio', 'Penthouse', 'Townhouse'];

  favoriteMap: Map<string, boolean> = new Map();

  constructor(
    private propertyService: PropertyService,
    private favoriteService: FavoriteService
  ) {}

  ngOnInit(): void {
    this.loadProperties();
    this.updateFavorites();
  }

  loadProperties(): void {
    this.propertyService.getProperties().subscribe((properties: Property[]) => {
      this.allProperties = properties;
      this.extractUniqueCities();
      this.applyFilters();
      this.updateFavorites();
    });
  }

  extractUniqueCities(): void {
    const cities = new Set(this.allProperties.map(p => p.city));
    this.uniqueCities = Array.from(cities).sort();
  }

  updateFavorites(): void {
    if (this.currentUser) {
      this.allProperties.forEach(property => {
        const isFav = this.favoriteService.isFavorite(property.id, this.currentUser!.id);
        this.favoriteMap.set(property.id, isFav);
      });
    }
  }

  applyFilters(): void {
    let filtered = [...this.allProperties];

    // Search filter
    if (this.searchQuery.trim()) {
      filtered = this.propertyService.searchProperties(this.searchQuery);
    }

    // City filter
    if (this.selectedCity) {
      filtered = filtered.filter(p => p.city === this.selectedCity);
    }

    // Property type filter
    if (this.selectedPropertyType) {
      filtered = filtered.filter(p => p.propertyType === this.selectedPropertyType);
    }

    // Sort
    filtered = this.sortProperties(filtered);

    this.filteredProperties = filtered;
  }

  sortProperties(properties: Property[]): Property[] {
    const sorted = [...properties];

    switch (this.sortBy) {
      case 'price_asc':
        sorted.sort((a, b) => a.expectedRent - b.expectedRent);
        break;
      case 'price_desc':
        sorted.sort((a, b) => b.expectedRent - a.expectedRent);
        break;
      case 'area_asc':
        sorted.sort((a, b) => a.area - b.area);
        break;
      case 'area_desc':
        sorted.sort((a, b) => b.area - a.area);
        break;
      case 'recent':
      default:
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return sorted;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onCityChange(): void {
    this.applyFilters();
  }

  onPropertyTypeChange(): void {
    this.applyFilters();
  }

  onSortChange(): void {
    this.applyFilters();
  }

  toggleFavorite(propertyId: string, event: Event): void {
    event.stopPropagation();

    if (!this.currentUser) {
      alert('Please login to add favorites');
      return;
    }

    const isFav = this.favoriteMap.get(propertyId) || false;

    if (isFav) {
      this.favoriteService.removeFavorite(propertyId, this.currentUser.id);
    } else {
      this.favoriteService.addFavorite(propertyId, this.currentUser.id);
    }

    this.favoriteMap.set(propertyId, !isFav);
  }

  isFavorite(propertyId: string): boolean {
    return this.favoriteMap.get(propertyId) || false;
  }

  onViewProperty(propertyId: string): void {
    this.viewProperty.emit(propertyId);
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCity = '';
    this.selectedPropertyType = '';
    this.sortBy = 'recent';
    this.applyFilters();
  }

  trackByPropertyId(index: number, property: Property): string {
    return property.id;
  }
}
