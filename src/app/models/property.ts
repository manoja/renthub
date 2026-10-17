export type PropertyType = 'Apartment' | 'House' | 'Villa' | 'Studio' | 'Penthouse' | 'Townhouse';
export type LeaseType = 'LongTerm' | 'ShortTerm' | 'Both';
export type FurnishedStatus = 'Furnished' | 'Semi-Furnished' | 'Unfurnished';
export type TenantPreference = 'Any' | 'Bachelors' | 'Family';

export type PriceMode = 'Monthly' | 'Yearly';
export type Amenity = 
  | 'Gym/Fitness Center'
  | 'Swimming Pool'
  | 'Car Park'
  | 'Visitors Parking'
  | 'Power Backup'
  | 'Garbage Disposal'
  | 'Private Lawn'
  | 'Water Heater'
  | 'Plant Security System'
  | 'Laundry Service'
  | 'Elevator'
  | 'Club House';

export interface Property {
  id: string;
  ownerId: number;
  propertyType: PropertyType;
  buildingName: string;
  sharedStatus: boolean; // true if shared property
  address: string;
  city: string;
  state: string;
  area: number; // in sq ft
  expectedRent: number;
  negotiable: boolean;
  leaseType: LeaseType;
  priceMode: PriceMode;
  furnishedStatus: FurnishedStatus;
  vegetarianPreference: boolean;
  amenities: Amenity[];
  title: string;
  description: string; // Max 1,400 characters
  landlordName: string;
  landlordEmail: string;
  landlordPreference: TenantPreference;
  landlordPhone: string;
  photos: string[]; // Base64 encoded images
  createdAt: Date;
  updatedAt: Date;
}

export interface PropertyFormData {
  propertyType: PropertyType;
  buildingName: string;
  sharedStatus: boolean;
  address: string;
  city: string;
  state: string;
  area: number;
  expectedRent: number;
  negotiable: boolean;
  leaseType: LeaseType;
  priceMode: PriceMode;
  furnishedStatus: FurnishedStatus;
  vegetarianPreference: boolean;
  amenities: Amenity[];
  landlordPreference: TenantPreference;
  title: string;
  description: string;
  landlordName: string;
  landlordEmail: string;
  landlordPhone: string;
  photos: string[];
}
