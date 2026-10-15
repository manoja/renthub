import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DemoInquiry } from '../models/inquiry';

@Injectable({
  providedIn: 'root'
})
export class DemoInquiryService {
  private inquiries$ = new BehaviorSubject<DemoInquiry[]>([]);
  private nextInquiryId = 1;
  private readonly storageKey = 'renthub_inquiries';
  private readonly idKey = 'renthub_inquiryId';

  constructor() {
    this.loadFromStorage();
  }

  getInquiries(): Observable<DemoInquiry[]> {
    return this.inquiries$.asObservable();
  }

  getPropertyInquiries(propertyId: string): DemoInquiry[] {
    return this.inquiries$.value.filter(i => i.propertyId === propertyId);
  }

  getUserInquiries(userId: number): DemoInquiry[] {
    return this.inquiries$.value.filter(i => i.userId === userId);
  }

  createInquiry(
    propertyId: string,
    userId: number,
    userName: string,
    userEmail: string,
    userPhone: string,
    message: string
  ): DemoInquiry {
    const inquiry: DemoInquiry = {
      id: `inquiry_${this.nextInquiryId++}`,
      propertyId,
      userId,
      userName,
      userEmail,
      userPhone,
      message,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const current = this.inquiries$.value;
    this.inquiries$.next([...current, inquiry]);
    this.saveToStorage();

    return inquiry;
  }

  updateInquiryStatus(
    id: string,
    status: 'pending' | 'accepted' | 'rejected',
    userId: number
  ): DemoInquiry | null {
    const inquiry = this.inquiries$.value.find(i => i.id === id);
    // In a real app, verify userId is the property owner
    if (!inquiry) {
      return null;
    }

    const updated: DemoInquiry = {
      ...inquiry,
      status,
      updatedAt: new Date()
    };

    const current = this.inquiries$.value;
    const index = current.findIndex(i => i.id === id);
    if (index !== -1) {
      current[index] = updated;
      this.inquiries$.next([...current]);
      this.saveToStorage();
      return updated;
    }

    return null;
  }

  private saveToStorage(): void {
    const inquiries = this.inquiries$.value;
    localStorage.setItem(this.storageKey, JSON.stringify(inquiries));
    localStorage.setItem(this.idKey, this.nextInquiryId.toString());
  }

  private loadFromStorage(): void {
    const stored = localStorage.getItem(this.storageKey);
    const storedId = localStorage.getItem(this.idKey);

    if (stored) {
      const inquiries = JSON.parse(stored).map((i: any) => ({
        ...i,
        createdAt: new Date(i.createdAt),
        updatedAt: new Date(i.updatedAt)
      }));
      this.inquiries$.next(inquiries);
    }

    if (storedId) {
      this.nextInquiryId = parseInt(storedId, 10);
    }
  }
}
