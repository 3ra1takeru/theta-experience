export enum EventType {
  ZOOM = 'Zoom',
  IN_PERSON = '対面'
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // ISO string
  startTime: string;
  endTime: string;
  type: EventType;
  location?: string; // For in-person
  capacity: number;
  price: number;
  status: 'upcoming' | 'full' | 'closed';
  prefecture?: string;
  address?: string;
  mapUrl?: string;
}

export interface Registration {
  id: string;
  eventId: string;
  applicantName: string;
  email: string;
  phone: string;
  prefecture?: string; // New
  dob?: string;       // New (YYYY-MM-DD)
  paymentMethod?: 'paypal' | 'paypay' | 'bank_transfer'; // New
  registeredAt: string;
  status: 'confirmed' | 'canceled';
  surveySent: boolean;
}

export interface Feedback {
  id: string;
  eventId: string;
  authorName: string; // Usually anonymous or initials
  rating: number; // 1-5
  comment: string;
  isApproved: boolean; // For admin moderation
  createdAt: string;
  gender?: string;
  ageGroup?: string;
  prefecture?: string;
}

export interface InstructorProfile {
  name: string;
  title: string;
  introduction: string;
  imageUrl?: string;
  instagramUrl?: string;
  websiteUrl?: string;
}

export interface PaymentSettings {
  bankName: string;
  bankBranch: string;
  bankAccount: string;
  bankAccountName: string;
  paypayId: string;
}

// Helper to simulate database latency
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));