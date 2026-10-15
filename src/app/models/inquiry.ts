export interface DemoInquiry {
  id: string;
  propertyId: string;
  userId: number;
  userName: string;
  userEmail: string;
  userPhone: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface DemoInquiryFormData {
  userPhone: string;
  message: string;
}
