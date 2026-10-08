/**
 * Mock data layer — same shapes the Firestore layer will serve later.
 * Sample content uses Shri Durga Parameshwari Temple, Kateel as an example.
 */
import type {
  Announcement,
  Booking,
  DailyInfo,
  Donation,
  Seva,
  TempleEvent,
  TempleProfile,
} from '../types';

export const templeProfile: TempleProfile = {
  name: { en: 'Sri Durga Parameshwari Temple', kn: 'ಶ್ರೀ ದುರ್ಗಾ ಪರಮೇಶ್ವರಿ ದೇವಸ್ಥಾನ' },
  tagline: {
    en: 'Sri Durga Parameshwari Temple located in Koruvail (Koruvale), Kudlu, Kasaragod',
    kn: 'ಕಾಸರಗೋಡು, ಕುಡ್ಲು, ಕೊರುವೈಲ್ (ಕೊರುವಲೆ)ನಲ್ಲಿರುವ ಶ್ರೀ ದುರ್ಗಾ ಪರಮೇಶ್ವರಿ ದೇವಸ್ಥಾನ',
  },
  logoUrl: '',
  coverUrl: '',
  galleryUrls: [],
  about: {
    en: 'A sacred abode of Goddess Durga Parameshwari at Koruvail (Koruvale), Kudlu in Kasaragod district, Kerala — a place of deep devotion and centuries of tradition.',
    kn: 'ಕೇರಳದ ಕಾಸರಗೋಡು ಜಿಲ್ಲೆಯ ಕುಡ್ಲುವಿನ ಕೊರುವೈಲ್ (ಕೊರುವಲೆ)ನಲ್ಲಿರುವ ದುರ್ಗಾ ಪರಮೇಶ್ವರಿ ದೇವಿಯ ಪವಿತ್ರ ಸನ್ನಿಧಿ — ಆಳವಾದ ಭಕ್ತಿ ಮತ್ತು ಶತಮಾನಗಳ ಸಂಪ್ರದಾಯದ ಸ್ಥಳ.',
  },
  address: 'Koruvail (Koruvale), Kudlu, Kasaragod, Kerala',
  mapsUrl: 'https://maps.google.com/?q=Sri+Durga+Parameshwari+Temple+Koruvail+Kudlu+Kasaragod',
  phone: '+91 98765 43210',
  whatsapp: '+91 98765 43210',
  email: 'info@sridurgaparameshwari.example',
  socials: {},
  timings: {
    morning: '5:30 AM – 12:30 PM',
    evening: '4:00 PM – 8:30 PM',
    fridaySpecial: '5:00 AM – 9:00 PM (extended deeparadhana)',
  },
  liveDarshanUrl: '',
  reg80G: '80G Reg. No. ABCD1234EF',
};

export const sevas: Seva[] = [
  {
    id: 'archana',
    name: { en: 'Archana / Kumkuma Archana', kn: 'ಅರ್ಚನೆ / ಕುಂಕುಮ ಅರ್ಚನೆ' },
    desc: {
      en: 'Offering of prayers with vermilion (kumkuma), auspicious for Goddess Durga.',
      kn: 'ಕುಂಕುಮದಿಂದ ಪೂಜೆ — ದುರ್ಗಾ ದೇವಿಗೆ ಅತ್ಯಂತ ಶುಭ.',
    },
    price: 50,
    durationMin: 15,
    capacity: 20,
    slotTimes: ['06:00', '08:00', '10:00', '18:00'],
    active: true,
  },
  {
    id: 'pooja-offerings',
    name: { en: 'Pooja Offerings', kn: 'ಪೂಜಾ ಸಮರ್ಪಣೆ' },
    desc: {
      en: 'Special floral offerings or daily standard poojas (morning/evening) on behalf of a family.',
      kn: 'ಕುಟುಂಬದ ಪರವಾಗಿ ವಿಶೇಷ ಪುಷ್ಪ ಸಮರ್ಪಣೆ ಅಥವಾ ದೈನಂದಿನ ಪೂಜೆ (ಬೆಳಿಗ್ಗೆ/ಸಂಜೆ).',
    },
    price: 250,
    durationMin: 30,
    capacity: 10,
    slotTimes: ['07:00', '18:30'],
    active: true,
  },
  {
    id: 'naga-seva',
    name: { en: 'Naga Seva / Bana Offerings', kn: 'ನಾಗ ಸೇವೆ / ಬನ ಸಮರ್ಪಣೆ' },
    desc: {
      en: 'Prayers and offerings to serpent deities, connected to the temple Naga Bana / Kavu.',
      kn: 'ದೇವಸ್ಥಾನದ ನಾಗ ಬನ / ಕಾವಿಗೆ ಸಂಬಂಧಿಸಿದ ಸರ್ಪ ದೇವತೆಗಳಿಗೆ ಪ್ರಾರ್ಥನೆ ಮತ್ತು ಸಮರ್ಪಣೆ.',
    },
    price: 500,
    durationMin: 45,
    capacity: 8,
    slotTimes: ['09:00'],
    active: true,
  },
  {
    id: 'friday-special',
    name: { en: 'Special Friday Offerings', kn: 'ಶುಕ್ರವಾರ ವಿಶೇಷ ಸಮರ್ಪಣೆ' },
    desc: {
      en: 'Extended evening rituals and deeparadhana, sacred to Goddess Durga Parameshwari.',
      kn: 'ದುರ್ಗಾ ಪರಮೇಶ್ವರಿ ದೇವಿಗೆ ಪವಿತ್ರವಾದ ವಿಸ್ತೃತ ಸಂಜೆ ಪೂಜೆ ಮತ್ತು ದೀಪಾರಾಧನೆ.',
    },
    price: 1000,
    durationMin: 60,
    capacity: 15,
    slotTimes: ['18:00', '19:30'],
    active: true,
  },
];

export const announcements: Announcement[] = [
  {
    id: 'a1',
    text: {
      en: 'Navaratri celebrations begin October 20 — special poojas every evening.',
      kn: 'ಅಕ್ಟೋಬರ್ 20 ರಿಂದ ನವರಾತ್ರಿ ಉತ್ಸವ — ಪ್ರತಿದಿನ ಸಂಜೆ ವಿಶೇಷ ಪೂಜೆ.',
    },
    createdAt: '2026-10-07',
  },
];

export const dailyInfo: DailyInfo = {
  date: '2026-10-08',
  special: {
    en: 'Friday deeparadhana at 6:30 PM — all devotees welcome.',
    kn: 'ಶುಕ್ರವಾರ ಸಂಜೆ 6:30 ಕ್ಕೆ ದೀಪಾರಾಧನೆ — ಎಲ್ಲಾ ಭಕ್ತರಿಗೂ ಸ್ವಾಗತ.',
  },
};

export const events: TempleEvent[] = [
  {
    id: 'navaratri-2026',
    name: { en: 'Navaratri Utsava', kn: 'ನವರಾತ್ರಿ ಉತ್ಸವ' },
    desc: {
      en: 'Nine nights of devotion to Goddess Durga with special alankara and poojas.',
      kn: 'ದುರ್ಗಾ ದೇವಿಗೆ ಒಂಬತ್ತು ರಾತ್ರಿಗಳ ಭಕ್ತಿ — ವಿಶೇಷ ಅಲಂಕಾರ ಮತ್ತು ಪೂಜೆಗಳು.',
    },
    date: '2026-10-20',
    time: '6:00 PM',
    location: 'Main temple',
    rsvpEnabled: true,
    rsvpCount: 132,
  },
  {
    id: 'deepavali-2026',
    name: { en: 'Deepavali', kn: 'ದೀಪಾವಳಿ' },
    desc: {
      en: 'Festival of lights — laksha deepotsava in the temple courtyard.',
      kn: 'ಬೆಳಕಿನ ಹಬ್ಬ — ದೇವಸ್ಥಾನದ ಅಂಗಳದಲ್ಲಿ ಲಕ್ಷ ದೀಪೋತ್ಸವ.',
    },
    date: '2026-11-08',
    time: '6:30 PM',
    location: 'Temple courtyard',
    rsvpEnabled: false,
  },
];

/** A sample upcoming booking to demo the "day-of" popup and next-seva card. */
export const myBookings: Booking[] = [
  {
    id: 'b1',
    bookingCode: 'SDP-20261008-001',
    sevaId: 'archana',
    sevaName: { en: 'Archana / Kumkuma Archana', kn: 'ಅರ್ಚನೆ / ಕುಂಕುಮ ಅರ್ಚನೆ' },
    date: '2026-10-08',
    time: '18:00',
    devoteeName: 'Ashok Naik',
    phone: '+91 98765 43210',
    gotra: 'Kashyapa',
    people: 4,
    payMode: 'payAtTemple',
    status: 'confirmed',
    createdAt: '2026-10-06',
  },
];

export const myDonations: Donation[] = [
  {
    id: 'd1',
    devoteeName: 'Ashok Naik',
    phone: '+91 98765 43210',
    amount: 1100,
    purpose: 'Annadaan',
    anonymous: false,
    mode: 'online',
    receiptNo: 'SDP-D-2026-0001',
    createdAt: '2026-09-15',
  },
];

/** Next major event for the home-screen countdown. */
export function nextMajorEvent(fromDate: string): TempleEvent | null {
  const upcoming = events
    .filter((e) => e.date >= fromDate)
    .sort((a, b) => (a.date < b.date ? -1 : 1));
  return upcoming[0] ?? null;
}

/* ---------------- Booking engine (mock layer) ---------------- */

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

const LOCAL_BOOKINGS_KEY = 'temple-bookings-v1';

export function loadLocalBookings(): Booking[] {
  try {
    const raw = localStorage.getItem(LOCAL_BOOKINGS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as Booking[]) : [];
  } catch {
    return [];
  }
}

function persistLocalBookings(list: Booking[]): void {
  localStorage.setItem(LOCAL_BOOKINGS_KEY, JSON.stringify(list));
}

/** All bookings: sample data + devotee's own (persisted locally). */
export function allBookings(): Booking[] {
  return [...myBookings, ...loadLocalBookings()].sort((a, b) =>
    a.date === b.date ? (a.time < b.time ? -1 : 1) : a.date < b.date ? -1 : 1,
  );
}

/** Deterministic demo availability for a slot, plus the devotee's own bookings. */
export function getSlotBooked(sevaId: string, date: string, time: string): number {
  const seva = sevas.find((s) => s.id === sevaId);
  if (!seva) return 0;
  const demo = hashStr(`${sevaId}|${date}|${time}`) % Math.max(1, Math.ceil(seva.capacity / 2));
  const mine = loadLocalBookings().filter(
    (b) => b.sevaId === sevaId && b.date === date && b.time === time && b.status === 'confirmed',
  ).length;
  return Math.min(seva.capacity, demo + mine);
}

export function seatsLeft(sevaId: string, date: string, time: string): number {
  const seva = sevas.find((s) => s.id === sevaId);
  if (!seva) return 0;
  return Math.max(0, seva.capacity - getSlotBooked(sevaId, date, time));
}

export interface NewBookingInput {
  sevaId: string;
  date: string;
  time: string;
  devoteeName: string;
  phone: string;
  gotra?: string;
  people: number;
  sankalpa?: string;
  payMode: 'online' | 'payAtTemple';
}

export function createBooking(input: NewBookingInput): Booking {
  const seva = sevas.find((s) => s.id === input.sevaId);
  if (!seva) throw new Error(`unknown seva ${input.sevaId}`);
  if (seatsLeft(input.sevaId, input.date, input.time) < 1) {
    throw new Error('slot full');
  }
  const seq = String(loadLocalBookings().length + 1).padStart(3, '0');
  const booking: Booking = {
    id: `b-local-${Date.now()}`,
    bookingCode: `SDP-${input.date.replace(/-/g, '')}-${seq}`,
    sevaId: input.sevaId,
    sevaName: seva.name,
    date: input.date,
    time: input.time,
    devoteeName: input.devoteeName.trim(),
    phone: input.phone.replace(/\D/g, '').slice(-10),
    gotra: input.gotra?.trim() || undefined,
    people: input.people,
    sankalpa: input.sankalpa?.trim() || undefined,
    payMode: input.payMode,
    status: 'confirmed',
    createdAt: new Date().toISOString().slice(0, 10),
  };
  const list = loadLocalBookings();
  list.push(booking);
  persistLocalBookings(list);
  return booking;
}

export function cancelBooking(id: string): boolean {
  const sample = myBookings.find((b) => b.id === id);
  if (sample) {
    sample.status = 'cancelled';
    return true;
  }
  const list = loadLocalBookings();
  const ix = list.findIndex((b) => b.id === id);
  if (ix < 0) return false;
  list[ix] = { ...list[ix], status: 'cancelled' };
  persistLocalBookings(list);
  return true;
}

export function findBookingByCode(code: string): Booking | null {
  return allBookings().find((b) => b.bookingCode === code) ?? null;
}
