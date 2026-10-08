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
  name: { en: 'Shri Durga Parameshwari Temple', kn: 'ಶ್ರೀ ದುರ್ಗಾ ಪರಮೇಶ್ವರಿ ದೇವಸ್ಥಾನ' },
  tagline: {
    en: 'Sri Durga Parameshwari Temple located in Koruvail (Koruvale), Kudlu, Kasaragod',
    kn: 'ಕಾಸರಗೋಡು, ಕುಡ್ಲು, ಕೊರುವೈಲ್ (ಕೊರುವಲೆ)ನಲ್ಲಿರುವ ಶ್ರೀ ದುರ್ಗಾ ಪರಮೇಶ್ವರಿ ದೇವಸ್ಥಾನ',
  },
  logoUrl: '',
  coverUrl: '',
  galleryUrls: [],
  about: {
    en: 'An ancient temple of Goddess Durga Parameshwari on the banks of the Nandini river, known for the sacred Naga Bana and centuries of devotion.',
    kn: 'ನಂದಿನಿ ನದಿಯ ದಡದಲ್ಲಿರುವ ದುರ್ಗಾ ಪರಮೇಶ್ವರಿ ದೇವಿಯ ಪುರಾತನ ದೇವಸ್ಥಾನ. ಪವಿತ್ರ ನಾಗ ಬನ ಮತ್ತು ಶತಮಾನಗಳ ಭಕ್ತಿಗೆ ಹೆಸರುವಾಸಿ.',
  },
  address: 'Kateel, Dakshina Kannada, Karnataka 574148',
  mapsUrl: 'https://maps.google.com/?q=Kateel+Durga+Parameshwari+Temple',
  phone: '+91 98765 43210',
  whatsapp: '+91 98765 43210',
  email: 'info@kateeltemple.example',
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
    bookingCode: 'KTL-20261008-001',
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
    receiptNo: 'KTL-D-2026-0001',
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
