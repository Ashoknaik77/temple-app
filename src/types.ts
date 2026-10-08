/**
 * Temple app domain types. These mirror the Firestore collections;
 * the data layer (src/data) implements these shapes against mock data
 * now and Firestore later.
 */

export interface Localized {
  en: string;
  kn: string;
}

/** Single doc: templeProfile/config — fully admin-editable branding. */
export interface TempleProfile {
  name: Localized;
  tagline: Localized;
  logoUrl: string;
  coverUrl: string;
  galleryUrls: string[];
  about: Localized;
  address: string;
  mapsUrl: string;
  phone: string;
  whatsapp: string;
  email: string;
  socials: { youtube?: string; instagram?: string; facebook?: string };
  timings: { morning: string; evening: string; fridaySpecial: string };
  liveDarshanUrl?: string;
  reg80G?: string;
  trustDetails?: string;
}

export interface Seva {
  id: string;
  name: Localized;
  desc: Localized;
  price: number; // ₹, 0 = free
  durationMin: number;
  capacity: number; // max bookings per slot
  slotTimes: string[]; // e.g. ['06:00', '18:00']
  photoUrl?: string;
  active: boolean;
}

export interface SevaSlot {
  sevaId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  booked: number;
  capacity: number;
}

export type BookingStatus = 'confirmed' | 'completed' | 'cancelled';
export type PayMode = 'online' | 'payAtTemple';

export interface Booking {
  id: string;
  bookingCode: string; // human QR/ID, e.g. KTL-20261008-001
  sevaId: string;
  sevaName: Localized;
  date: string;
  time: string;
  devoteeName: string;
  phone: string;
  gotra?: string;
  people: number;
  sankalpa?: string;
  payMode: PayMode;
  status: BookingStatus;
  createdAt: string;
}

export type DonationPurpose =
  | 'Annadaan'
  | 'Temple Maintenance'
  | 'Gopuja'
  | 'Vidya Daan'
  | 'General'
  | 'Other';

export interface Donation {
  id: string;
  devoteeName: string;
  phone: string;
  email?: string;
  amount: number;
  purpose: DonationPurpose;
  note?: string;
  anonymous: boolean;
  mode: 'online' | 'offline';
  receiptNo: string;
  createdAt: string;
}

export interface TempleEvent {
  id: string;
  name: Localized;
  desc: Localized;
  date: string;
  time: string;
  location: string;
  posterUrl?: string;
  rsvpEnabled: boolean;
  rsvpCount?: number;
}

export interface Announcement {
  id: string;
  text: Localized;
  createdAt: string;
}

export interface DailyInfo {
  date: string;
  special?: Localized;
}

export interface Devotee {
  phone: string; // doc id
  name: string;
  email?: string;
  gotra?: string;
  familyMembers: string[];
}
