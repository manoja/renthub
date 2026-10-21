import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
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
  sanitizedImageCache: Map<string, SafeUrl> = new Map();

  showContactModal: boolean = false;
  selectedContactProperty: Property | null = null;

  constructor(
    private propertyService: PropertyService,
    private favoriteService: FavoriteService,
    private sanitizer: DomSanitizer
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
    console.log('🔍 applyFilters() called');
    console.log('Total properties:', this.allProperties.length);
    console.log('Search Query:', this.searchQuery);
    console.log('Selected City:', this.selectedCity);
    console.log('Selected Property Type:', this.selectedPropertyType);

    // Search filter
    if (this.searchQuery.trim()) {
      filtered = this.propertyService.searchProperties(this.searchQuery);
      console.log('After search filter:', filtered.length);
    }

    // City filter
    if (this.selectedCity) {
      filtered = filtered.filter(p => p.city === this.selectedCity);
      console.log('After city filter:', filtered.length);
    }

    // Property type filter
    if (this.selectedPropertyType) {
      filtered = filtered.filter(p => p.propertyType === this.selectedPropertyType);
      console.log('After property type filter:', filtered.length);
    }

    // Sort
    filtered = this.sortProperties(filtered);
    console.log('Final filtered results:', filtered.length);

    this.filteredProperties = filtered;
  }

  sortProperties(properties: Property[]): Property[] {
    let sorted = [...properties];

    // Handle Favorites filter
    if (this.sortBy === 'favorites') {
      if (!this.currentUser) {
        console.log('⚠️ User not logged in, cannot show favorites');
        return [];
      }
      // Filter to only show favorite properties
      sorted = sorted.filter(p => this.isFavorite(p.id));
      console.log('After favorites filter:', sorted.length);
      // Sort by most recently added to favorites
      sorted.sort((a, b) => {
        const aFav = this.favoriteService.getFavoriteByPropertyAndUser(a.id, this.currentUser!.id);
        const bFav = this.favoriteService.getFavoriteByPropertyAndUser(b.id, this.currentUser!.id);
        if (aFav && bFav) {
          return new Date(bFav.addedAt).getTime() - new Date(aFav.addedAt).getTime();
        }
        return 0;
      });
      return sorted;
    }

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
    console.log('🔎 onSearchChange() called, query:', this.searchQuery);
    this.applyFilters();
  }

  onCityChange(): void {
    console.log('🏙️ onCityChange() called, city:', this.selectedCity);
    this.applyFilters();
  }

  onPropertyTypeChange(): void {
    console.log('🏠 onPropertyTypeChange() called, type:', this.selectedPropertyType);
    this.applyFilters();
  }

  onSortChange(): void {
    console.log('📊 onSortChange() called, sortBy:', this.sortBy);
    if (this.sortBy === 'favorites') {
      console.log('❤️ Fetching favorite properties for user:', this.currentUser?.id);
      if (!this.currentUser) {
        console.log('⚠️ User not logged in');
        alert('Please login to view your favorite properties');
        this.sortBy = 'recent';
      }
    }
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

  openContactModal(property: Property): void {
    this.selectedContactProperty = property;
    this.showContactModal = true;
  }

  closeContactModal(): void {
    this.showContactModal = false;
    this.selectedContactProperty = null;
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

  getSafeImageUrl(imageUrl: string): SafeUrl {
    // Check if URL is already cached
    if (this.sanitizedImageCache.has(imageUrl)) {
      return this.sanitizedImageCache.get(imageUrl)!;
    }

    // Sanitize and cache the URL
    const safeUrl = this.sanitizer.bypassSecurityTrustUrl(imageUrl);
    this.sanitizedImageCache.set(imageUrl, safeUrl);
    return safeUrl;
  }

  getUpdatedTimeLabel(updatedAt: Date): string {
    const now = new Date();
    const updated = new Date(updatedAt);
    const diffMs = now.getTime() - updated.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffDays === 0 && diffHours < 24) {
      return 'Updated today';
    } else if (diffDays === 1) {
      return 'Updated yesterday';
    } else if (diffDays < 30) {
      return `Updated ${diffDays} days ago`;
    } else {
      const diffMonths = Math.floor(diffDays / 30);
      return `Updated ${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    }
  }
}
