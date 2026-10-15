import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Property, PropertyFormData, Amenity, PropertyType, LeaseType, PriceMode } from '../../models/property';

interface PropertyFormState {
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
  furnishedStatus: LeaseType;
  vegetarianPreference: boolean;
  amenities: Amenity[];
  title: string;
  description: string;
  landlordName: string;
  landlordEmail: string;
  landlordPhone: string;
  photos: string[];
}

@Component({
  selector: 'app-property-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './property-form.component.html',
  styleUrl: './property-form.component.scss'
})
export class PropertyFormComponent implements OnInit {
  @Input() property?: Property | null;
  @Output() submit = new EventEmitter<PropertyFormData>();
  @Output() cancel = new EventEmitter<void>();

  formData: PropertyFormState = {
    propertyType: 'Apartment',
    buildingName: '',
    sharedStatus: false,
    address: '',
    city: '',
    state: '',
    area: 0,
    expectedRent: 0,
    negotiable: false,
    leaseType: 'Furnished',
    priceMode: 'Monthly',
    furnishedStatus: 'Furnished',
    vegetarianPreference: false,
    amenities: [],
    title: '',
    description: '',
    landlordName: '',
    landlordEmail: '',
    landlordPhone: '',
    photos: []
  };

  showPreview: boolean = false;
  descriptionChars: number = 0;
  maxDescriptionChars = 1400;

  amenityOptions: Amenity[] = [
    'Gym/Fitness Center',
    'Swimming Pool',
    'Car Park',
    'Visitors Parking',
    'Power Backup',
    'Garbage Disposal',
    'Private Lawn',
    'Water Heater',
    'Plant Security System',
    'Laundry Service',
    'Elevator',
    'Club House'
  ];

  propertyTypeOptions: PropertyType[] = [
    'Apartment',
    'House',
    'Villa',
    'Studio',
    'Penthouse',
    'Townhouse'
  ];

  leaseTypeOptions: LeaseType[] = ['Furnished', 'Semi-Furnished', 'Unfurnished'];
  priceOptions: PriceMode[] = ['Monthly', 'Yearly'];

  validationErrors: { [key: string]: string } = {};

  ngOnInit(): void {
    if (this.property) {
      this.formData = {
        propertyType: this.property.propertyType,
        buildingName: this.property.buildingName,
        sharedStatus: this.property.sharedStatus,
        address: this.property.address,
        city: this.property.city,
        state: this.property.state,
        area: this.property.area,
        expectedRent: this.property.expectedRent,
        negotiable: this.property.negotiable,
        leaseType: this.property.leaseType,
        priceMode: this.property.priceMode,
        furnishedStatus: this.property.furnishedStatus,
        vegetarianPreference: this.property.vegetarianPreference,
        amenities: [...this.property.amenities],
        title: this.property.title,
        description: this.property.description,
        landlordName: this.property.landlordName,
        landlordEmail: this.property.landlordEmail,
        landlordPhone: this.property.landlordPhone,
        photos: [...this.property.photos]
      };
      this.descriptionChars = this.formData.description.length;
    }
  }

  onDescriptionChange(): void {
    this.descriptionChars = this.formData.description.length;
  }

  onTitleChange(value: string): void {
    this.formData.title = value;
  }

  onBuildingNameChange(value: string): void {
    this.formData.buildingName = value;
  }

  onAddressChange(value: string): void {
    this.formData.address = value;
  }

  onCityChange(value: string): void {
    this.formData.city = value;
  }

  onStateChange(value: string): void {
    this.formData.state = value;
  }

  onAreaChange(value: any): void {
    this.formData.area = value;
  }

  onRentChange(value: any): void {
    this.formData.expectedRent = value;
  }

  onLandlordNameChange(value: string): void {
    this.formData.landlordName = value;
  }

  onLandlordEmailChange(value: string): void {
    this.formData.landlordEmail = value;
  }

  onLandlordPhoneChange(value: string): void {
    this.formData.landlordPhone = value;
  }

  toggleAmenity(amenity: Amenity): void {
    const index = this.formData.amenities.indexOf(amenity);
    if (index > -1) {
      this.formData.amenities.splice(index, 1);
    } else {
      this.formData.amenities.push(amenity);
    }
  }

  isAmenitySelected(amenity: Amenity): boolean {
    return this.formData.amenities.includes(amenity);
  }

  onPhotoSelected(event: any): void {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file type
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
          alert('Only JPEG, PNG, and WebP images are allowed');
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('Image size must be less than 5MB');
          continue;
        }

        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.formData.photos.push(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removePhoto(index: number): void {
    this.formData.photos.splice(index, 1);
  }

  validateForm(): boolean {
    this.validationErrors = {};

    // Required fields
    if (!this.formData.title.trim()) {
      this.validationErrors['title'] = 'Title is required';
    }
    if (!this.formData.buildingName.trim()) {
      this.validationErrors['buildingName'] = 'Building name is required';
    }
    if (!this.formData.address.trim()) {
      this.validationErrors['address'] = 'Address is required';
    }
    if (!this.formData.city.trim()) {
      this.validationErrors['city'] = 'City is required';
    }
    if (!this.formData.state.trim()) {
      this.validationErrors['state'] = 'State is required';
    }
    if (!this.formData.landlordName.trim()) {
      this.validationErrors['landlordName'] = 'Landlord name is required';
    }
    if (!this.formData.landlordEmail.trim()) {
      this.validationErrors['landlordEmail'] = 'Landlord email is required';
    } else if (!this.isValidEmail(this.formData.landlordEmail)) {
      this.validationErrors['landlordEmail'] = 'Invalid email format';
    }
    if (!this.formData.landlordPhone.trim()) {
      this.validationErrors['landlordPhone'] = 'Landlord phone is required';
    }

    // Numeric validations
    if (this.formData.area <= 0) {
      this.validationErrors['area'] = 'Area must be a positive number';
    }
    if (this.formData.expectedRent <= 0) {
      this.validationErrors['expectedRent'] = 'Rent must be a positive number';
    }

    // Description
    if (this.formData.description.length > this.maxDescriptionChars) {
      this.validationErrors['description'] = `Description exceeds ${this.maxDescriptionChars} characters`;
    }

    // At least one photo
    if (this.formData.photos.length === 0) {
      this.validationErrors['photos'] = 'At least one photo is required';
    }

    return Object.keys(this.validationErrors).length === 0;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  showFormPreview(): void {
    this.syncFormDataFromDOM();
    if (this.validateForm()) {
      this.showPreview = true;
    }
  }

  private syncFormDataFromDOM(): void {
    // Manually capture form input values from DOM elements
    // This ensures browser automation input is properly captured
    const titleInput = document.querySelector('#title') as HTMLInputElement;
    const descInput = document.querySelector('#description') as HTMLTextAreaElement;
    const buildingInput = document.querySelector('#buildingName') as HTMLInputElement;
    const addressInput = document.querySelector('#address') as HTMLInputElement;
    const cityInput = document.querySelector('#city') as HTMLInputElement;
    const stateInput = document.querySelector('#state') as HTMLInputElement;
    const areaInput = document.querySelector('#area') as HTMLInputElement;
    const rentInput = document.querySelector('#expectedRent') as HTMLInputElement;
    const landlordNameInput = document.querySelector('#landlordName') as HTMLInputElement;
    const landlordEmailInput = document.querySelector('#landlordEmail') as HTMLInputElement;
    const landlordPhoneInput = document.querySelector('#landlordPhone') as HTMLInputElement;

    console.log('=== Syncing Form Data from DOM ===');
    if (titleInput) {
      this.formData.title = titleInput.value;
      console.log('Title from DOM:', titleInput.value);
    }
    if (descInput) {
      this.formData.description = descInput.value;
      console.log('Description from DOM:', descInput.value);
    }
    if (buildingInput) {
      this.formData.buildingName = buildingInput.value;
      console.log('Building from DOM:', buildingInput.value);
    }
    if (addressInput) {
      this.formData.address = addressInput.value;
      console.log('Address from DOM:', addressInput.value);
    }
    if (cityInput) {
      this.formData.city = cityInput.value;
      console.log('City from DOM:', cityInput.value);
    }
    if (stateInput) {
      this.formData.state = stateInput.value;
      console.log('State from DOM:', stateInput.value);
    }
    if (areaInput) {
      this.formData.area = parseInt(areaInput.value) || 0;
      console.log('Area from DOM:', areaInput.value);
    }
    if (rentInput) {
      this.formData.expectedRent = parseInt(rentInput.value) || 0;
      console.log('Rent from DOM:', rentInput.value);
    }
    if (landlordNameInput) {
      this.formData.landlordName = landlordNameInput.value;
      console.log('Landlord Name from DOM:', landlordNameInput.value);
    }
    if (landlordEmailInput) {
      this.formData.landlordEmail = landlordEmailInput.value;
      console.log('Landlord Email from DOM:', landlordEmailInput.value);
    }
    if (landlordPhoneInput) {
      this.formData.landlordPhone = landlordPhoneInput.value;
      console.log('Landlord Phone from DOM:', landlordPhoneInput.value);
    }
    console.log('=== Final formData ===', JSON.stringify(this.formData, null, 2));
  }

  editForm(): void {
    this.showPreview = false;
  }

  confirmSubmit(): void {
    if (this.validateForm()) {
      const formData: PropertyFormData = { ...this.formData };
      console.log('=== Form Data Being Submitted ===');
      console.log('Title:', formData.title);
      console.log('City:', formData.city);
      console.log('Rent:', formData.expectedRent);
      console.log('Full Data:', JSON.stringify(formData, null, 2));
      this.submit.emit(formData);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
