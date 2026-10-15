import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Property } from '../../models/property';
import { PropertyService } from '../../services/property.service';
import { FavoriteService } from '../../services/favorite.service';

interface User {
  id: number;
  name: string;
  email: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  @Input() currentUser: User | null = null;
  @Output() back = new EventEmitter<void>();
  @Output() viewFavorites = new EventEmitter<void>();
  @Output() createListing = new EventEmitter<void>();
  @Output() editListing = new EventEmitter<string>();
  @Output() viewProperty = new EventEmitter<string>();

  userListings: Property[] = [];
  favoriteCount: number = 0;

  constructor(
    private propertyService: PropertyService,
    private favoriteService: FavoriteService
  ) {}

  ngOnInit(): void {
    this.loadUserListings();
    this.loadFavoriteCount();
  }

  loadUserListings(): void {
    if (this.currentUser) {
      this.userListings = this.propertyService.getUserProperties(this.currentUser.id);
    }
  }

  loadFavoriteCount(): void {
    if (this.currentUser) {
      const favorites = this.favoriteService.getUserFavorites(this.currentUser.id);
      this.favoriteCount = favorites.length;
    }
  }

  deleteListing(propertyId: string): void {
    if (!this.currentUser) return;

    if (confirm('Are you sure you want to delete this listing?')) {
      this.propertyService.deleteProperty(propertyId, this.currentUser.id);
      this.loadUserListings();
    }
  }

  onEditListing(propertyId: string): void {
    this.editListing.emit(propertyId);
  }

  onViewProperty(propertyId: string): void {
    this.viewProperty.emit(propertyId);
  }

  onViewFavorites(): void {
    this.viewFavorites.emit();
  }

  onCreateListing(): void {
    this.createListing.emit();
  }

  onBack(): void {
    this.back.emit();
  }
}
