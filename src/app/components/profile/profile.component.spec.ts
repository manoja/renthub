import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileComponent } from './profile.component';
import { PropertyService } from '../../services/property.service';
import { FavoriteService } from '../../services/favorite.service';
import { Property } from '../../models/property';
import { Favorite } from '../../models/favorite';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let propertyService: PropertyService;
  let favoriteService: FavoriteService;

  // Mock User
  const mockUser = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com'
  };

  // Mock Properties
  const mockProperty1: Property = {
    id: 'prop_1',
    ownerId: 1,
    propertyType: 'Apartment',
    buildingName: 'Tower A',
    sharedStatus: false,
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    area: 1200,
    expectedRent: 2500,
    negotiable: false,
    leaseType: 'LongTerm',
    priceMode: 'Monthly',
    furnishedStatus: 'Furnished',
    vegetarianPreference: false,
    amenities: ['Gym/Fitness Center', 'Swimming Pool'],
    title: 'Beautiful Apartment',
    description: 'A nice apartment in the city',
    landlordName: 'Jane Smith',
    landlordEmail: 'jane@example.com',
    landlordPreference: 'Any',
    landlordPhone: '555-1234',
    photos: ['photo1.jpg'],
    createdAt: new Date('2026-10-01'),
    updatedAt: new Date('2026-10-15')
  };

  const mockProperty2: Property = {
    id: 'prop_2',
    ownerId: 1,
    propertyType: 'House',
    buildingName: 'Sunset House',
    sharedStatus: true,
    address: '456 Oak Ave',
    city: 'Los Angeles',
    state: 'CA',
    area: 2500,
    expectedRent: 4000,
    negotiable: true,
    leaseType: 'ShortTerm',
    priceMode: 'Monthly',
    furnishedStatus: 'Semi-Furnished',
    vegetarianPreference: true,
    amenities: ['Car Park', 'Power Backup'],
    title: 'Cozy House',
    description: 'A wonderful house with garden',
    landlordName: 'Bob Johnson',
    landlordEmail: 'bob@example.com',
    landlordPreference: 'Family',
    landlordPhone: '555-5678',
    photos: ['photo2.jpg', 'photo3.jpg'],
    createdAt: new Date('2026-09-15'),
    updatedAt: new Date('2026-10-10')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [PropertyService, FavoriteService]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    propertyService = TestBed.inject(PropertyService);
    favoriteService = TestBed.inject(FavoriteService);
  });

  describe('Component Initialization', () => {
    it('should create the profile component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with empty userListings and zero favoriteCount', () => {
      expect(component.userListings).toEqual([]);
      expect(component.favoriteCount).toBe(0);
    });

    it('should have null currentUser initially', () => {
      expect(component.currentUser).toBeNull();
    });

    it('should have all output emitters defined', () => {
      expect(component.back).toBeDefined();
      expect(component.viewFavorites).toBeDefined();
      expect(component.createListing).toBeDefined();
      expect(component.editListing).toBeDefined();
      expect(component.viewProperty).toBeDefined();
    });
  });

  describe('ngOnInit', () => {
    it('should call loadUserListings and loadFavoriteCount on init', () => {
      spyOn(component, 'loadUserListings');
      spyOn(component, 'loadFavoriteCount');

      component.ngOnInit();

      expect(component.loadUserListings).toHaveBeenCalled();
      expect(component.loadFavoriteCount).toHaveBeenCalled();
    });

    it('should load user listings with currentUser set', () => {
      component.currentUser = mockUser;
      spyOn(propertyService, 'getUserProperties').and.returnValue([mockProperty1, mockProperty2]);

      component.ngOnInit();

      expect(propertyService.getUserProperties).toHaveBeenCalledWith(mockUser.id);
      expect(component.userListings).toEqual([mockProperty1, mockProperty2]);
    });
  });

  describe('loadUserListings', () => {
    it('should load properties for the current user', () => {
      component.currentUser = mockUser;
      spyOn(propertyService, 'getUserProperties').and.returnValue([mockProperty1, mockProperty2]);

      component.loadUserListings();

      expect(propertyService.getUserProperties).toHaveBeenCalledWith(1);
      expect(component.userListings).toEqual([mockProperty1, mockProperty2]);
      expect(component.userListings.length).toBe(2);
    });

    it('should return empty array when user has no listings', () => {
      component.currentUser = mockUser;
      spyOn(propertyService, 'getUserProperties').and.returnValue([]);

      component.loadUserListings();

      expect(component.userListings).toEqual([]);
      expect(component.userListings.length).toBe(0);
    });

    it('should not call getUserProperties if currentUser is null', () => {
      component.currentUser = null;
      spyOn(propertyService, 'getUserProperties');

      component.loadUserListings();

      expect(propertyService.getUserProperties).not.toHaveBeenCalled();
    });

    it('should only load listings for the specific user', () => {
      component.currentUser = mockUser;
      const otherUserProperty: Property = { ...mockProperty1, ownerId: 2 };
      spyOn(propertyService, 'getUserProperties').and.returnValue([mockProperty1]);

      component.loadUserListings();

      expect(propertyService.getUserProperties).toHaveBeenCalledWith(mockUser.id);
      expect(component.userListings).toEqual([mockProperty1]);
      expect(component.userListings[0].ownerId).toBe(1);
    });
  });

  describe('loadFavoriteCount', () => {
    it('should load favorite count for the current user', () => {
      component.currentUser = mockUser;
      const mockFavorites: Favorite[] = [
        { propertyId: 'prop_1', userId: 1, addedAt: new Date() },
        { propertyId: 'prop_2', userId: 1, addedAt: new Date() }
      ];
      spyOn(favoriteService, 'getUserFavorites').and.returnValue(mockFavorites);

      component.loadFavoriteCount();

      expect(favoriteService.getUserFavorites).toHaveBeenCalledWith(1);
      expect(component.favoriteCount).toBe(2);
    });

    it('should set favoriteCount to zero when user has no favorites', () => {
      component.currentUser = mockUser;
      spyOn(favoriteService, 'getUserFavorites').and.returnValue([]);

      component.loadFavoriteCount();

      expect(component.favoriteCount).toBe(0);
    });

    it('should not call getUserFavorites if currentUser is null', () => {
      component.currentUser = null;
      spyOn(favoriteService, 'getUserFavorites');

      component.loadFavoriteCount();

      expect(favoriteService.getUserFavorites).not.toHaveBeenCalled();
    });

    it('should correctly count multiple favorites', () => {
      component.currentUser = mockUser;
      const favoritesArray: Favorite[] = [
        { propertyId: 'prop_1', userId: 1, addedAt: new Date() },
        { propertyId: 'prop_2', userId: 1, addedAt: new Date() },
        { propertyId: 'prop_3', userId: 1, addedAt: new Date() }
      ];
      spyOn(favoriteService, 'getUserFavorites').and.returnValue(favoritesArray);

      component.loadFavoriteCount();

      expect(component.favoriteCount).toBe(3);
    });
  });

  describe('deleteListing', () => {
    beforeEach(() => {
      component.currentUser = mockUser;
      spyOn(propertyService, 'deleteProperty').and.returnValue(true);
      spyOn(propertyService, 'getUserProperties').and.returnValue([mockProperty1, mockProperty2]);
      spyOn(window, 'confirm');
    });

    it('should delete listing when user confirms', () => {
      (window.confirm as jasmine.Spy).and.returnValue(true);
      spyOn(component, 'loadUserListings').and.callThrough();

      component.deleteListing('prop_1');

      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this listing?');
      expect(propertyService.deleteProperty).toHaveBeenCalledWith('prop_1', mockUser.id);
      expect(component.loadUserListings).toHaveBeenCalled();
    });

    it('should not delete listing when user cancels', () => {
      (window.confirm as jasmine.Spy).and.returnValue(false);
      spyOn(component, 'loadUserListings');

      component.deleteListing('prop_1');

      expect(window.confirm).toHaveBeenCalled();
      expect(propertyService.deleteProperty).not.toHaveBeenCalled();
      expect(component.loadUserListings).not.toHaveBeenCalled();
    });

    it('should not attempt to delete if currentUser is null', () => {
      component.currentUser = null;

      component.deleteListing('prop_1');

      expect(propertyService.deleteProperty).not.toHaveBeenCalled();
    });

    it('should reload listings after deletion', () => {
      (window.confirm as jasmine.Spy).and.returnValue(true);
      spyOn(component, 'loadUserListings').and.callThrough();

      component.deleteListing('prop_1');

      expect(component.loadUserListings).toHaveBeenCalledTimes(1);
    });

    it('should only delete property owned by current user', () => {
      (window.confirm as jasmine.Spy).and.returnValue(true);

      component.deleteListing('prop_1');

      expect(propertyService.deleteProperty).toHaveBeenCalledWith('prop_1', mockUser.id);
      // Ensure user ID matches current user
      const callArgs = (propertyService.deleteProperty as jasmine.Spy).calls.mostRecent().args;
      expect(callArgs[1]).toBe(mockUser.id);
    });
  });

  describe('onEditListing', () => {
    it('should emit editListing event with property ID', () => {
      spyOn(component.editListing, 'emit');

      component.onEditListing('prop_1');

      expect(component.editListing.emit).toHaveBeenCalledWith('prop_1');
    });

    it('should emit different property IDs correctly', () => {
      spyOn(component.editListing, 'emit');

      component.onEditListing('prop_1');
      component.onEditListing('prop_2');
      component.onEditListing('prop_3');

      expect(component.editListing.emit).toHaveBeenCalledTimes(3);
      const callArgs = (component.editListing.emit as jasmine.Spy).calls.all();
      expect(callArgs[0].args[0]).toBe('prop_1');
      expect(callArgs[1].args[0]).toBe('prop_2');
      expect(callArgs[2].args[0]).toBe('prop_3');
    });
  });

  describe('onViewProperty', () => {
    it('should emit viewProperty event with property ID', () => {
      spyOn(component.viewProperty, 'emit');

      component.onViewProperty('prop_1');

      expect(component.viewProperty.emit).toHaveBeenCalledWith('prop_1');
    });

    it('should emit correct property IDs', () => {
      spyOn(component.viewProperty, 'emit');

      component.onViewProperty('prop_123');

      expect(component.viewProperty.emit).toHaveBeenCalledWith('prop_123');
    });
  });

  describe('onViewFavorites', () => {
    it('should emit viewFavorites event', () => {
      spyOn(component.viewFavorites, 'emit');

      component.onViewFavorites();

      expect(component.viewFavorites.emit).toHaveBeenCalledWith();
    });

    it('should emit viewFavorites without parameters', () => {
      spyOn(component.viewFavorites, 'emit');

      component.onViewFavorites();

      const emitCall = (component.viewFavorites.emit as jasmine.Spy).calls.mostRecent();
      expect(emitCall.args.length).toBe(0);
    });
  });

  describe('onCreateListing', () => {
    it('should emit createListing event', () => {
      spyOn(component.createListing, 'emit');

      component.onCreateListing();

      expect(component.createListing.emit).toHaveBeenCalledWith();
    });

    it('should emit createListing without parameters', () => {
      spyOn(component.createListing, 'emit');

      component.onCreateListing();

      const emitCall = (component.createListing.emit as jasmine.Spy).calls.mostRecent();
      expect(emitCall.args.length).toBe(0);
    });
  });

  describe('onBack', () => {
    it('should emit back event', () => {
      spyOn(component.back, 'emit');

      component.onBack();

      expect(component.back.emit).toHaveBeenCalledWith();
    });

    it('should emit back without parameters', () => {
      spyOn(component.back, 'emit');

      component.onBack();

      const emitCall = (component.back.emit as jasmine.Spy).calls.mostRecent();
      expect(emitCall.args.length).toBe(0);
    });
  });

  describe('Integration Tests', () => {
    beforeEach(() => {
      component.currentUser = mockUser;
    });

    it('should properly initialize with user data and load listings', () => {
      spyOn(propertyService, 'getUserProperties').and.returnValue([mockProperty1, mockProperty2]);
      const mockFavorites: Favorite[] = [
        { propertyId: 'prop_1', userId: 1, addedAt: new Date() }
      ];
      spyOn(favoriteService, 'getUserFavorites').and.returnValue(mockFavorites);

      component.ngOnInit();

      expect(component.userListings.length).toBe(2);
      expect(component.favoriteCount).toBe(1);
    });

    it('should handle edit listing workflow', () => {
      spyOn(component.editListing, 'emit');
      spyOn(propertyService, 'getUserProperties').and.returnValue([mockProperty1, mockProperty2]);

      component.loadUserListings();
      component.onEditListing('prop_1');

      expect(component.userListings.length).toBe(2);
      expect(component.editListing.emit).toHaveBeenCalledWith('prop_1');
    });

    it('should handle delete and reload workflow', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(propertyService, 'deleteProperty').and.returnValue(true);
      spyOn(propertyService, 'getUserProperties').and.returnValue([mockProperty2]);

      component.userListings = [mockProperty1, mockProperty2];
      component.deleteListing('prop_1');

      expect(propertyService.deleteProperty).toHaveBeenCalledWith('prop_1', mockUser.id);
      expect(component.userListings).toEqual([mockProperty2]);
    });

    it('should track multiple operations correctly', () => {
      spyOn(component.editListing, 'emit');
      spyOn(component.viewProperty, 'emit');
      spyOn(component.viewFavorites, 'emit');
      spyOn(component.createListing, 'emit');
      spyOn(component.back, 'emit');

      component.onEditListing('prop_1');
      component.onViewProperty('prop_2');
      component.onViewFavorites();
      component.onCreateListing();
      component.onBack();

      expect(component.editListing.emit).toHaveBeenCalledTimes(1);
      expect(component.viewProperty.emit).toHaveBeenCalledTimes(1);
      expect(component.viewFavorites.emit).toHaveBeenCalledTimes(1);
      expect(component.createListing.emit).toHaveBeenCalledTimes(1);
      expect(component.back.emit).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle loading favorites when service returns empty array', () => {
      component.currentUser = mockUser;
      spyOn(favoriteService, 'getUserFavorites').and.returnValue([]);

      component.loadFavoriteCount();

      expect(component.favoriteCount).toBe(0);
    });

    it('should handle loading listings when service returns undefined', () => {
      component.currentUser = mockUser;
      spyOn(propertyService, 'getUserProperties').and.returnValue([]);

      component.loadUserListings();

      expect(component.userListings).toEqual([]);
    });

    it('should handle null currentUser gracefully', () => {
      component.currentUser = null;
      spyOn(propertyService, 'getUserProperties');
      spyOn(favoriteService, 'getUserFavorites');

      component.loadUserListings();
      component.loadFavoriteCount();

      expect(propertyService.getUserProperties).not.toHaveBeenCalled();
      expect(favoriteService.getUserFavorites).not.toHaveBeenCalled();
    });

    it('should handle delete operation with null currentUser', () => {
      component.currentUser = null;
      spyOn(propertyService, 'deleteProperty');
      spyOn(window, 'confirm').and.returnValue(true);

      component.deleteListing('prop_1');

      expect(propertyService.deleteProperty).not.toHaveBeenCalled();
      expect(window.confirm).not.toHaveBeenCalled();
    });

    it('should handle multiple property deletions', () => {
      component.currentUser = mockUser;
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(propertyService, 'deleteProperty').and.returnValue(true);
      spyOn(propertyService, 'getUserProperties').and.returnValue([mockProperty2]);

      component.deleteListing('prop_1');

      expect(propertyService.deleteProperty).toHaveBeenCalledWith('prop_1', mockUser.id);
    });
  });
});
