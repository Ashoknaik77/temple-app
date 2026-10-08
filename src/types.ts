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
/** Payment is settled outside the app (UPI/cash at temple); admin marks it. */
export type PaymentStatus = 'unpaid' | 'paid';

export interface Booking {
  id: string;
  bookingCode: string; // human QR/ID, e.g. KTL-20261008-001
  sevaId: string;
  sevaName: Localized;
  date: string;
  time: string;
  devoteeName: string;
  phone: string;
  gotra?: string; // legacy (older bookings)
  people?: number; // legacy (older bookings)
  sankalpa?: string; // legacy (older bookings)
  payMode: PayMode;
  status: BookingStatus;
  paymentStatus: PaymentStatus; // unpaid until the temple office confirms payment
  paidBy?: string; // name of the admin who marked it paid
  paidAt?: string; // date it was marked paid (YYYY-MM-DD)
  receiptNo?: string; // seva payment receipt number (issued once paid)
  place: string; // devotee's place / town
  note?: string; // optional note for the temple office
  createdAt: string;
}

/** Temple admin user. Phone number is the unique id (Firestore doc id). */
export interface AdminUser {
  phone: string; // 10-digit, unique
  name: string;
  pinHash: string; // SHA-256 of the login PIN (never store the raw PIN)
  role: 'super' | 'admin'; // super user creates/manages other admins
  active: boolean;
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

/* ---------------- temple expenses (admin-only) ---------------- */

export type ExpensePaymentMode = 'Cash' | 'UPI' | 'Bank' | 'Cheque' | 'Card';

export interface ExpenseCategory {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
}

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  categoryId: string;
  categoryName: string; // denormalized so history survives category edits/deletes
  amount: number; // ₹, integer
  paymentMode: ExpensePaymentMode;
  paidTo: string;
  vendorPhone?: string;
  invoiceNo?: string;
  note?: string;
  /** downscaled JPEG data URL (free: stored in the doc, no Storage bucket needed) */
  receiptDataUrl?: string;
  /** required when the category is "Other" */
  customNote?: string;
  deleted: boolean;
  // audit trail
  createdBy?: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
  deletedBy?: string;
  deletedAt?: string;
}

export interface NewExpenseInput {
  date: string;
  categoryId: string;
  amount: number;
  paymentMode: ExpensePaymentMode;
  paidTo: string;
  vendorPhone?: string;
  invoiceNo?: string;
  note?: string;
  receiptDataUrl?: string;
  customNote?: string;
}

/** Admin-uploaded gallery photo — collection `galleryPhotos/{id}` (data URL, downscaled). */
export interface GalleryPhoto {
  id: string;
  dataUrl: string;
  caption?: string;
  uploadedBy?: string;
  uploadedAt: string;
}
