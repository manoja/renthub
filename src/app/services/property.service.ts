import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Property, PropertyFormData } from '../models/property';

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  private properties$ = new BehaviorSubject<Property[]>([]);
  private nextPropertyId = 1;
  private readonly storageKey = 'renthub_properties';
  private readonly idKey = 'renthub_propertyId';

  constructor() {
    this.loadFromStorage();
  }

  getProperties(): Observable<Property[]> {
    return this.properties$.asObservable();
  }

  getPropertyById(id: string): Property | undefined {
    return this.properties$.value.find(p => p.id === id);
  }

  getUserProperties(userId: number): Property[] {
    return this.properties$.value.filter(p => p.ownerId === userId);
  }

  createProperty(formData: PropertyFormData, ownerId: number): Property {
    console.log('💾 PropertyService.createProperty() called');
    console.log('Owner ID:', ownerId);
    console.log('Form Data:', JSON.stringify(formData, null, 2));
    
    const property: Property = {
      id: `prop_${this.nextPropertyId++}`,
      ownerId,
      ...formData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('🔧 Created property object:', JSON.stringify(property, null, 2));

    const current = this.properties$.value;
    this.properties$.next([...current, property]);
    
    console.log('💿 Saving to localStorage...');
    this.saveToStorage();
    console.log('✅ Property saved to localStorage');
    console.log('📊 Total properties in storage:', this.properties$.value.length);

    return property;
  }

  updateProperty(id: string, formData: PropertyFormData, userId: number): Property | null {
    const property = this.getPropertyById(id);
    if (!property || property.ownerId !== userId) {
      return null; // Only owner can update
    }

    const updated: Property = {
      ...property,
      ...formData,
      updatedAt: new Date()
    };

    const current = this.properties$.value;
    const index = current.findIndex(p => p.id === id);
    if (index !== -1) {
      current[index] = updated;
      this.properties$.next([...current]);
      this.saveToStorage();
      return updated;
    }

    return null;
  }

  deleteProperty(id: string, userId: number): boolean {
    const property = this.getPropertyById(id);
    if (!property || property.ownerId !== userId) {
      return false; // Only owner can delete
    }

    const current = this.properties$.value.filter(p => p.id !== id);
    this.properties$.next(current);
    this.saveToStorage();
    return true;
  }

  searchProperties(query: string): Property[] {
    const q = query.toLowerCase();
    return this.properties$.value.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q) ||
      p.address.toLowerCase().includes(q) ||
      p.buildingName.toLowerCase().includes(q)
    );
  }

  getPropertiesByCity(city: string): Property[] {
    return this.properties$.value.filter(p => 
      p.city.toLowerCase() === city.toLowerCase()
    );
  }

  private saveToStorage(): void {
    const properties = this.properties$.value;
    console.log('📝 saveToStorage() writing to localStorage');
    console.log('Properties to save:', properties.length);
    localStorage.setItem(this.storageKey, JSON.stringify(properties));
    localStorage.setItem(this.idKey, this.nextPropertyId.toString());
    console.log('✅ localStorage updated');
    console.log('🔍 Verification - Reading back from localStorage:');
    const stored = localStorage.getItem(this.storageKey);
    console.log('Stored properties:', stored ? JSON.parse(stored).length : 0);
  }

  private loadFromStorage(): void {
    const stored = localStorage.getItem(this.storageKey);
    const storedId = localStorage.getItem(this.idKey);

    if (stored) {
      const properties = JSON.parse(stored).map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt)
      }));
      this.properties$.next(properties);
    }

    if (storedId) {
      this.nextPropertyId = parseInt(storedId, 10);
    }
  }
}
