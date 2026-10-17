import { Component, OnInit, OnChanges, SimpleChanges, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Property, PropertyFormData, Amenity, PropertyType, LeaseType, PriceMode ,FurnishedStatus, TenantPreference } from '../../models/property';

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
  furnishedStatus: FurnishedStatus;
  vegetarianPreference: boolean;
  amenities: Amenity[];
  title: string;
  description: string;
  landlordName: string;
  landlordEmail: string;
  landlordPreference: TenantPreference;
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
export class PropertyFormComponent implements OnInit, OnChanges {
  @Input() property?: Property | null;
  @Output() formSubmit = new EventEmitter<PropertyFormData>();
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
    leaseType: 'LongTerm',
    priceMode: 'Monthly',
    furnishedStatus: 'Furnished',
    vegetarianPreference: false,
    amenities: [],
    title: '',
    description: '',
    landlordName: '',
    landlordEmail: '',
    landlordPreference: 'Any',
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
  leaseTypeOptions: LeaseType[] = ['LongTerm', 'ShortTerm', 'Both'];
  furnishedOptions: FurnishedStatus[] = ['Furnished', 'Semi-Furnished', 'Unfurnished'];
  tenantPreferenceOptions: TenantPreference[] = ['Any', 'Bachelors', 'Family'];
  priceOptions: PriceMode[] = ['Monthly', 'Yearly'];

  validationErrors: { [key: string]: string } = {};

  private initializeFormData(): void {
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
        landlordPreference: this.property.landlordPreference,
        landlordPhone: this.property.landlordPhone,
        photos: [...this.property.photos]
      };
      this.descriptionChars = this.formData.description.length;
    }
  }

  ngOnInit(): void {
    this.initializeFormData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['property']) {
      this.initializeFormData();
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
      // Check photo limit (max 3)
      if (this.formData.photos.length + files.length > 3) {
        alert('Maximum 3 photos allowed. Please remove some photos first.');
        return;
      }

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file type
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
          alert('Only JPEG, PNG, and WebP images are allowed');
          continue;
        }

        // Validate file size (max 5MB original)
        if (file.size > 5 * 1024 * 1024) {
          alert('Image size must be less than 5MB');
          continue;
        }

        const reader = new FileReader();
        reader.onload = (e: any) => {
          // Compress image using Canvas (async)
          this.compressImage(e.target.result).then(compressedDataUrl => {
            this.formData.photos.push(compressedDataUrl);
          });
        };
        reader.readAsDataURL(file);
      }
    }
  }

  private compressImage(dataUrl: string): Promise<string> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const img = document.createElement('img');
      
      img.onload = () => {
        // Calculate dimensions (max 1200px)
        const maxDim = 1200;
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxDim) {
            height = (height * maxDim) / width;
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = (width * maxDim) / height;
            height = maxDim;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to JPEG with quality 0.7
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(compressedDataUrl);
      };
      
      img.src = dataUrl;
    });
  }

  removePhoto(index: number): void {
    this.formData.photos.splice(index, 1);
  }

  validateForm(): boolean {
    this.validationErrors = {};
    console.log('🔍 validateForm() checking...');

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

    const isValid = Object.keys(this.validationErrors).length === 0;
    console.log(isValid ? '✅ Validation PASSED' : '❌ Validation FAILED', this.validationErrors);
    return isValid;
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
    }
    if (descInput) {
      this.formData.description = descInput.value;
    }
    if (buildingInput) {
      this.formData.buildingName = buildingInput.value;
    }
    if (addressInput) {
      this.formData.address = addressInput.value;
    }
    if (cityInput) {
      this.formData.city = cityInput.value;
    }
    if (stateInput) {
      this.formData.state = stateInput.value;
    }
    if (areaInput) {
      this.formData.area = parseInt(areaInput.value) || 0;
    }
    if (rentInput) {
      this.formData.expectedRent = parseInt(rentInput.value) || 0;
    }
    if (landlordNameInput) {
      this.formData.landlordName = landlordNameInput.value;
    }
    if (landlordEmailInput) {
      this.formData.landlordEmail = landlordEmailInput.value;
    }
    if (landlordPhoneInput) {
      this.formData.landlordPhone = landlordPhoneInput.value;
    }
  }

  editForm(): void {
    this.showPreview = false;
  }

  confirmSubmit(): void {
    
    if (this.validateForm()) {
      const formData: PropertyFormData = { ...this.formData };
      
      this.formSubmit.emit(formData);
    } else {
      console.log('Validation Errors:', this.validationErrors);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
