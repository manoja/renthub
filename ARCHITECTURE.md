# RentHub - System Architecture & Design Patterns

## 📐 Architecture Overview

RentHub follows a **modular, component-based architecture** with clear separation of concerns, utilizing Angular's standalone components and reactive programming patterns.

```
┌─────────────────────────────────────────────────────────────┐
│                     ROOT COMPONENT (app.ts)                 │
│                   State Management & Routing                │
└────────┬────────────────────────────────────────────────────┘
         │
    ┌────┴────────────────────────────────────────┐
    │                                              │
┌───▼──────────────┐              ┌──────────────▼──┐
│   COMPONENTS     │              │   SERVICES      │
├──────────────────┤              ├─────────────────┤
│ PropertyListing  │              │ PropertyService │
│ PropertyDetails  │              │ FavoriteService │
│ PropertyForm     │              │ CommentService  │
│ Profile          │              │ InquiryService  │
│ Favorites        │              └─────────────────┘
└────────┬─────────┘
         │
    ┌────▼──────────┐
    │   GUARDS      │
    ├───────────────┤
    │ AuthGuard     │
    │ OwnerGuard    │
    └───────────────┘
```

---

## 🏗️ Component Hierarchy

### 1. Root Component (app.ts)
**Responsibility:** Global state management, routing, authentication

```typescript
AppComponent
├── Header (Navigation)
├── Auth Modals (Login/Register)
├── Page Content (Router Outlet)
│   ├── PropertyListingComponent
│   ├── PropertyFormComponent
│   ├── PropertyDetailsComponent
│   ├── ProfileComponent
│   └── FavoritesComponent
└── Footer
```

### 2. Component Tree Structure

```
app (Root)
│
├─ app-property-listing (Browse properties)
│  ├─ Filters Section
│  ├─ Properties Grid
│  └─ Contact Owner Modal
│
├─ app-property-form (Create/Edit property)
│  ├─ Form Section
│  ├─ Photo Upload
│  └─ Preview Mode
│
├─ app-property-details (View details)
│  ├─ Photo Gallery
│  ├─ Property Info
│  ├─ Comments Section
│  └─ Inquiries
│
├─ app-profile (User dashboard)
│  ├─ User Info
│  ├─ My Listings
│  └─ Favorites Count
│
└─ app-favorites (Favorites page)
   └─ Favorite Properties Grid
```

---

## 🔄 Data Flow Architecture

### State Management Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                    Components                               │
│                  (UI Layer)                                │
└────────────┬──────────────────────────────┬─────────────────┘
             │                              │
        ┌────▼─────────────┐       ┌───────▼──────────┐
        │  User Interactions│       │  Route Changes  │
        └────┬─────────────┘       └────┬──────────────┘
             │                          │
        ┌────▼──────────────────────────▼────┐
        │         Services                   │
        │  (Business Logic & Data)           │
        ├──────────────────────────────────┤
        │ • PropertyService                │
        │ • FavoriteService                │
        │ • CommentService                 │
        └────────────┬─────────────────────┘
                     │
        ┌────────────▼──────────────────┐
        │   localStorage / State        │
        │  (BehaviorSubject)           │
        └──────────────────────────────┘
```

### Data Persistence Flow

```
User Action
    ↓
Component Handler
    ↓
Service Method
    ↓
Update BehaviorSubject
    ↓
Save to localStorage
    ↓
Component Receives Update (Subscribe)
    ↓
UI Re-renders
```

---

## 🎯 Key Design Patterns Used

### 1. **Reactive Pattern** (RxJS)
```typescript
// Services expose data as Observables
properties$ = new BehaviorSubject<Property[]>([]);

getProperties(): Observable<Property[]> {
  return this.properties$.asObservable();
}

// Components subscribe to changes
this.propertyService.getProperties().subscribe(properties => {
  this.allProperties = properties;
  this.applyFilters();
});
```

### 2. **Singleton Pattern** (Services)
```typescript
@Injectable({
  providedIn: 'root'  // Single instance across app
})
export class PropertyService { }
```

### 3. **Guard Pattern** (Route Protection)
```typescript
// Authentication guard
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  return authService.isLoggedIn() ? true : false;
};

// Owner verification guard
export const ownerGuard: CanActivateFn = (route, state) => {
  // Check if user owns the property
};
```

### 4. **Factory Pattern** (Component Creation)
```typescript
// PropertyService creates property objects
createProperty(formData, ownerId): Property {
  return {
    id: `prop_${this.nextId++}`,
    ownerId,
    ...formData,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}
```

### 5. **Observer Pattern** (Event Emission)
```typescript
@Output() formSubmit = new EventEmitter<PropertyFormData>();

confirmSubmit(): void {
  this.formSubmit.emit(this.formData);
}
```

### 6. **Strategy Pattern** (Filtering)
```typescript
applyFilters(): void {
  // Multiple filter strategies
  if (this.searchQuery) { /* search strategy */ }
  if (this.selectedCity) { /* city filter strategy */ }
  if (this.selectedPropertyType) { /* type filter strategy */ }
}
```

---

## 📦 Module Structure

### Standalone Components
All components are standalone (Angular 20 feature):
```typescript
@Component({
  selector: 'app-property-listing',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
```

### Service Layer
```
Services/
├── property.service.ts      // CRUD operations
├── favorite.service.ts      // Favorite management
├── comment.service.ts       // Comments
└── inquiry.service.ts       // Inquiries
```

### Models/Interfaces
```
Models/
├── property.ts              // Property types & interfaces
├── user.ts                  // User model
├── favorite.ts              // Favorite model
├── comment.ts               // Comment model
└── inquiry.ts               // Inquiry model
```

### Guards
```
Guards/
├── auth.guard.ts            // Authentication
└── owner.guard.ts           // Owner verification
```

---

## 🔐 Security Architecture

### Authentication Flow
```
Login Form
    ↓
Validate Credentials
    ↓
Store User in localStorage
    ↓
Set currentUser in app.ts
    ↓
AuthGuard checks on route change
    ↓
Allow/Deny navigation
```

### Property Edit/Delete Protection
```
User attempts edit/delete
    ↓
OwnerGuard verifies ownership
    ↓
Check: property.ownerId === currentUser.id
    ↓
If match: Allow operation
If no match: Redirect to home
```

### Image Security
```
Photo Upload (Base64)
    ↓
Store in localStorage
    ↓
On display: Use DomSanitizer
    ↓
bypassSecurityTrustUrl()
    ↓
Safe rendering
```

---

## 💾 Data Persistence Strategy

### localStorage Keys
```
renthub_users          // User accounts
renthub_properties     // Property listings
renthub_favorites      // User favorites
renthub_comments       // Property comments
renthub_inquiries      // Inquiries
renthub_currentUser    // Active user session
renthub_propertyId     // Property ID counter
```

### Data Serialization
```typescript
// Save to storage
saveToStorage(): void {
  const data = this.properties$.value;
  localStorage.setItem(storageKey, JSON.stringify(data));
}

// Load from storage
loadFromStorage(): void {
  const stored = localStorage.getItem(storageKey);
  if (stored) {
    const data = JSON.parse(stored).map(item => ({
      ...item,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt)
    }));
    this.properties$.next(data);
  }
}
```

---

## 🎨 UI Architecture

### CSS Organization
```
styles/
├── styles.scss              // Global styles
├── variables                // Colors, spacing
├── components/              // Component-scoped styles
│   ├── property-listing.scss
│   ├── property-form.scss
│   ├── property-details.scss
│   ├── profile.scss
│   └── favorites.scss
└── utilities/              // Utility classes
```

### Responsive Design Strategy
```
Mobile-First Approach
├── Base: Mobile (320px+)
├── Tablet: 768px+
├── Desktop: 1024px+
└── Large: 1400px+

CSS Grid & Flexbox
├── Component layouts
├── Responsive grids
└── Flexible spacing
```

---

## 🔄 Component Communication Patterns

### Parent → Child (via @Input)
```typescript
// Parent
<app-property-details [property]="selectedProperty"></app-property-details>

// Child
@Input() property: Property;
```

### Child → Parent (via @Output)
```typescript
// Child
@Output() formSubmit = new EventEmitter<PropertyFormData>();
this.formSubmit.emit(formData);

// Parent
<app-property-form (formSubmit)="handleSubmit($event)"></app-property-form>
```

### Sibling Communication (via Service)
```typescript
// Service
private propertySelected$ = new BehaviorSubject<Property | null>(null);

// Component 1: Emit
propertyService.selectProperty(property);

// Component 2: Listen
propertyService.propertySelected$.subscribe(property => {
  this.selectedProperty = property;
});
```

---

## 📊 State Management

### BehaviorSubject Pattern
```typescript
// Service maintains state
private properties$ = new BehaviorSubject<Property[]>([]);

// Components subscribe to changes
properties: Property[] = [];

constructor(private propertyService: PropertyService) {}

ngOnInit() {
  this.propertyService.getProperties().subscribe(props => {
    this.properties = props;
  });
}
```

### Unsubscribe Pattern (Memory Leak Prevention)
```typescript
private destroy$ = new Subject<void>();

ngOnInit() {
  this.service.data$
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => { /* handle data */ });
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

---

## 🧪 Testing Architecture

### Unit Test Structure
```typescript
describe('ComponentName', () => {
  let component: ComponentName;
  let fixture: ComponentFixture<ComponentName>;
  let service: MyService;

  beforeEach(async () => {
    // Setup
    TestBed.configureTestingModule({
      imports: [ComponentName],
      providers: [MyService]
    });
    
    fixture = TestBed.createComponent(ComponentName);
    component = fixture.componentInstance;
    service = TestBed.inject(MyService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should test specific behavior', () => {
    // Arrange
    component.property = mockData;
    
    // Act
    component.method();
    
    // Assert
    expect(component.result).toEqual(expected);
  });
});
```

### Test Types
1. **Unit Tests** - Individual component/service tests
2. **Integration Tests** - Component + Service tests
3. **Mock Data** - Realistic test objects
4. **Guard Tests** - Route protection tests

---

## 🚀 Performance Optimization

### Change Detection
```typescript
// OnPush strategy for better performance (if needed)
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

### Caching
```typescript
// Image URL caching
private sanitizedImageCache = new Map<string, SafeUrl>();

getSafeImageUrl(url: string): SafeUrl {
  if (this.sanitizedImageCache.has(url)) {
    return this.sanitizedImageCache.get(url)!;
  }
  const safeUrl = this.sanitizer.bypassSecurityTrustUrl(url);
  this.sanitizedImageCache.set(url, safeUrl);
  return safeUrl;
}
```

### TrackBy Function
```typescript
// Optimize *ngFor rendering
trackByPropertyId(index: number, property: Property): string {
  return property.id;
}

// Template
<div *ngFor="let prop of properties; trackBy: trackByPropertyId">
```

---

## 📈 Scalability Considerations

### Future Enhancements
1. **Backend API Integration**
   - Replace localStorage with HTTP calls
   - Implement real database
   - Add authentication tokens (JWT)

2. **State Management Library**
   - Migrate to NgRx or Akita
   - Centralized store
   - Time-travel debugging

3. **Performance Monitoring**
   - Analytics integration
   - Error tracking (Sentry)
   - Performance budgets

4. **Progressive Web App (PWA)**
   - Service workers
   - Offline capability
   - Push notifications

5. **Internationalization (i18n)**
   - Multi-language support
   - Locale handling
   - Translation management

---

## 🔗 Dependency Diagram

```
Components
    ↓
Services (PropertyService, FavoriteService, etc.)
    ↓
Models (Property, User, Favorite, etc.)
    ↓
localStorage / BehaviorSubject
    ↓
UI Rendering
```

---

## 📝 Code Quality Metrics

| Aspect | Implementation |
|--------|-----------------|
| Type Safety | Strict TypeScript |
| Code Organization | Modular structure |
| Error Handling | Try-catch, validation |
| Documentation | Inline comments |
| Testing | 48+ unit tests |
| Performance | Cached images, trackBy |

---

**Architecture Version:** 1.0  
**Last Updated:** October 2026
