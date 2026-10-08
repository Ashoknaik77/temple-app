/**
 * Temple app data layer.
 *
 * Backed by Cloud Firestore (project sri-durga-parameshwari) with a
 * localStorage fallback:
 *  - `initData()` (called once at app boot) tries Firestore first and falls
 *    back to local seed + localStorage when offline or unconfigured.
 *  - All reads are synchronous from an in-memory snapshot.
 *  - All writes are async: they update the snapshot, then persist to the
 *    active backend.
 *  - Tests use `initData({ backend: 'local' })` — fully hermetic, no network.
 *
 * Collections: templeProfile/config, sevas/{id}, events/{id},
 * announcements/{id}, bookings/{id}, donations/{id}.
 */
import type {
  AdminUser,
  Announcement,
  Booking,
  DailyInfo,
  Donation,
  Expense,
  ExpenseCategory,
  NewExpenseInput,
  Seva,
  TempleEvent,
  TempleProfile,
} from '../types';

/** Default Indian-temple expense categories (admin-editable). */
export const defaultExpenseCategories: ExpenseCategory[] = [
  'Pooja Materials',
  'Prasadam / Annadaan Ingredients',
  'Priest Salary / Dakshina',
  'Staff Salaries',
  'Electricity Bill',
  'Water Bill',
  'Gas / Fuel',
  'Temple Maintenance & Repairs',
  'Construction / Renovation',
  'Cleaning Supplies',
  'Decoration',
  'Sound System',
  'Printing',
  'Stationery / Office Supplies',
  'Bank Charges',
  'Loan Repayment / Interest',
  'Insurance Premium',
  'Government Fees / Taxes',
  'Travel',
  'Donations Given Out',
  'Catering / Event Food',
  'Photography / Videography',
  'Security Services',
  'Software / Subscriptions',
  'Miscellaneous',
  'Other',
].map((name, i) => ({
  id: `cat-${String(i + 1).padStart(2, '0')}`,
  name,
  active: true,
  createdAt: '2026-10-08',
}));

/* ============================ seed data ============================ */

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

/** Sample bookings/donations used to demo the app (also seeded in Firestore). */
export const myBookings: Booking[] = [
  {
    id: 'b1',
    bookingCode: 'SDP-20261008-001',
    sevaId: 'archana',
    sevaName: { en: 'Archana / Kumkuma Archana', kn: 'ಅರ್ಚನೆ / ಕುಂಕುಮ ಅರ್ಚನೆ' },
    date: '2026-10-08',
    time: '18:00',
    devoteeName: 'Ashok Naik',
    phone: '9876543210',
    place: 'Kasaragod',
    gotra: 'Kashyapa',
    people: 4,
    payMode: 'payAtTemple',
    status: 'confirmed',
    paymentStatus: 'unpaid',
    createdAt: '2026-10-06',
  },
];

export const myDonations: Donation[] = [
  {
    id: 'd1',
    devoteeName: 'Ashok Naik',
    phone: '9876543210',
    amount: 1100,
    purpose: 'Annadaan',
    anonymous: false,
    mode: 'online',
    receiptNo: 'SDP-D-2026-0001',
    createdAt: '2026-09-15',
  },
];

const SEED_BOOKING_IDS = new Set(myBookings.map((b) => b.id));
const SEED_DONATION_IDS = new Set(myDonations.map((d) => d.id));

/* ============================ store ============================ */

interface StoreState {
  profile: TempleProfile;
  sevas: Seva[];
  events: TempleEvent[];
  announcements: Announcement[];
  bookings: Booking[];
  donations: Donation[];
  admins: AdminUser[];
  expenses: Expense[];
  expenseCategories: ExpenseCategory[];
  /** booking codes created on this device (devotee-scoped views) */
  myCodes: string[];
  /** receipt numbers created on this device (devotee-scoped views) */
  myReceipts: string[];
}

type Backend = 'firestore' | 'local';

let state: StoreState | null = null;
let backend: Backend = 'local';

const LOCAL_BOOKINGS_KEY = 'temple-bookings-v1';
const LOCAL_DONATIONS_KEY = 'temple-donations-v1';
const LOCAL_ADMINS_KEY = 'temple-admins-v1';
const LOCAL_EXPENSES_KEY = 'temple-expenses-v1';
const LOCAL_EXPENSE_CATS_KEY = 'temple-expense-cats-v1';
const ADMIN_DB_KEY = 'temple-admin-db-v1';
const MY_CODES_KEY = 'temple-my-codes-v1';
const MY_RECEIPTS_KEY = 'temple-my-receipts-v1';
/** Demo default so the home-screen "today's seva" card works on first load. */
const DEFAULT_MY_CODES = ['SDP-20261008-001'];
const DEFAULT_MY_RECEIPTS = ['SDP-D-2026-0001'];

function deepCopy<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

function seedState(): StoreState {
  return {
    profile: deepCopy(templeProfile),
    sevas: deepCopy(sevas),
    events: deepCopy(events),
    announcements: deepCopy(announcements),
    bookings: deepCopy(myBookings),
    donations: deepCopy(myDonations),
    admins: [],
    expenses: [],
    expenseCategories: deepCopy(defaultExpenseCategories),
    myCodes: [...DEFAULT_MY_CODES],
    myReceipts: [...DEFAULT_MY_RECEIPTS],
  };
}

function readJSON(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function loadMyList(key: string, fallback: string[]): string[] {
  const v = readJSON(key);
  return Array.isArray(v) ? (v as string[]) : [...fallback];
}

function loadLocalState(): StoreState {
  const s = seedState();
  try {
    const adminDb = readJSON(ADMIN_DB_KEY) as {
      profile?: TempleProfile;
      sevas?: Seva[];
      events?: TempleEvent[];
      announcements?: Announcement[];
    } | null;
    if (adminDb && adminDb.profile && Array.isArray(adminDb.sevas)) {
      s.profile = adminDb.profile;
      s.sevas = adminDb.sevas;
      if (Array.isArray(adminDb.events)) s.events = adminDb.events;
      if (Array.isArray(adminDb.announcements)) s.announcements = adminDb.announcements;
    }
    const lb = readJSON(LOCAL_BOOKINGS_KEY);
    if (Array.isArray(lb)) s.bookings = [...s.bookings, ...(lb as Booking[])];
    const ld = readJSON(LOCAL_DONATIONS_KEY);
    if (Array.isArray(ld)) s.donations = [...s.donations, ...(ld as Donation[])];
    const la = readJSON(LOCAL_ADMINS_KEY);
    if (Array.isArray(la)) s.admins = la as AdminUser[];
    const le = readJSON(LOCAL_EXPENSES_KEY);
    if (Array.isArray(le)) s.expenses = le as Expense[];
    const lc = readJSON(LOCAL_EXPENSE_CATS_KEY);
    if (Array.isArray(lc) && lc.length > 0) s.expenseCategories = lc as ExpenseCategory[];
    s.myCodes = loadMyList(MY_CODES_KEY, DEFAULT_MY_CODES);
    s.myReceipts = loadMyList(MY_RECEIPTS_KEY, DEFAULT_MY_RECEIPTS);
  } catch {
    /* corrupted storage -> seed */
  }
  return s;
}

function persistLocal(): void {
  if (!state) return;
  try {
    localStorage.setItem(
      ADMIN_DB_KEY,
      JSON.stringify({
        profile: state.profile,
        sevas: state.sevas,
        events: state.events,
        announcements: state.announcements,
      }),
    );
    localStorage.setItem(
      LOCAL_BOOKINGS_KEY,
      JSON.stringify(state.bookings.filter((b) => !SEED_BOOKING_IDS.has(b.id))),
    );
    localStorage.setItem(
      LOCAL_DONATIONS_KEY,
      JSON.stringify(state.donations.filter((d) => !SEED_DONATION_IDS.has(d.id))),
    );
    localStorage.setItem(LOCAL_ADMINS_KEY, JSON.stringify(state.admins));
    localStorage.setItem(MY_CODES_KEY, JSON.stringify(state.myCodes));
    localStorage.setItem(MY_RECEIPTS_KEY, JSON.stringify(state.myReceipts));
  } catch {
    /* storage unavailable */
  }
}

/* ---------------- Firestore backend (lazy — no network unless used) ---------------- */

async function fsMod() {
  const [m, lib] = await Promise.all([import('firebase/firestore'), import('../lib/firebase')]);
  const db = lib.getDb();
  if (!db) throw new Error('firestore not configured');
  return { ...m, db };
}

async function loadFromFirestore(): Promise<StoreState | null> {
  const { db, collection, doc, getDoc, getDocs } = await fsMod();
  const profSnap = await getDoc(doc(db, 'templeProfile', 'config'));
  if (!profSnap.exists()) return null; // not seeded yet
  const [sevaSnap, eventSnap, annSnap, bookSnap, donSnap, adminSnap, expSnap, expCatSnap] = await Promise.all([
    getDocs(collection(db, 'sevas')),
    getDocs(collection(db, 'events')),
    getDocs(collection(db, 'announcements')),
    getDocs(collection(db, 'bookings')),
    getDocs(collection(db, 'donations')),
    getDocs(collection(db, 'admins')),
    getDocs(collection(db, 'expenses')),
    getDocs(collection(db, 'expenseCategories')),
  ]);
  return {
    profile: profSnap.data() as TempleProfile,
    sevas: sevaSnap.docs.map((d) => ({ id: d.id, ...(d.data() as object) }) as Seva),
    events: eventSnap.docs.map((d) => ({ id: d.id, ...(d.data() as object) }) as TempleEvent),
    announcements: annSnap.docs.map((d) => ({ id: d.id, ...(d.data() as object) }) as Announcement),
    bookings: bookSnap.docs.map((d) => ({ id: d.id, ...(d.data() as object) }) as Booking),
    donations: donSnap.docs.map((d) => ({ id: d.id, ...(d.data() as object) }) as Donation),
    admins: adminSnap.docs.map((d) => ({ phone: d.id, ...(d.data() as object) }) as AdminUser),
    expenses: expSnap.docs.map((d) => ({ id: d.id, ...(d.data() as object) }) as Expense),
    expenseCategories:
      expCatSnap.docs.length > 0
        ? expCatSnap.docs.map((d) => ({ id: d.id, ...(d.data() as object) }) as ExpenseCategory)
        : deepCopy(defaultExpenseCategories),
    myCodes: loadMyList(MY_CODES_KEY, DEFAULT_MY_CODES),
    myReceipts: loadMyList(MY_RECEIPTS_KEY, DEFAULT_MY_RECEIPTS),
  };
}

async function fsSet(coll: string, id: string, data: unknown): Promise<void> {
  const { db, doc, setDoc } = await fsMod();
  // Firestore rejects `undefined` field values (nested too) — strip them.
  await setDoc(doc(db, coll, id), stripUndefined(data) as Record<string, unknown>);
}

/** Deep-strip `undefined` values so Firestore writes never fail on optional fields. */
function stripUndefined<T>(v: T): T {
  if (Array.isArray(v)) return v.map(stripUndefined) as unknown as T;
  if (v && typeof v === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      if (val === undefined) continue;
      out[k] = stripUndefined(val);
    }
    return out as T;
  }
  return v;
}

async function fsDelete(coll: string, id: string): Promise<void> {
  const { db, doc, deleteDoc } = await fsMod();
  await deleteDoc(doc(db, coll, id));
}

/* ---------------- init ---------------- */

function ensureState(): StoreState {
  if (!state) {
    state = loadLocalState();
    backend = 'local';
  }
  return state;
}

/**
 * Load the data layer. Tries Firestore first (unless backend:'local'),
 * falls back to local seed + localStorage when unreachable.
 * Returns the backend actually in use.
 */
export async function initData(
  opts?: { backend?: 'auto' | 'firestore' | 'local' },
): Promise<Backend> {
  const want = opts?.backend ?? 'auto';
  state = null;
  if (want === 'local') {
    state = loadLocalState();
    backend = 'local';
    return backend;
  }
  try {
    const snap = await loadFromFirestore();
    if (snap) {
      state = snap;
      backend = 'firestore';
      return backend;
    }
  } catch (e) {
    console.warn('[temple] firestore unavailable, using local data', e);
  }
  state = loadLocalState();
  backend = 'local';
  return backend;
}

/** Which backend is currently serving reads/writes. */
export function activeBackend(): Backend {
  ensureState();
  return backend;
}

/* ============================ reads (sync) ============================ */

/** Devotee screens should read these so admin edits show up immediately. */
export function getTempleProfile(): TempleProfile {
  return ensureState().profile;
}
export function getSevas(): Seva[] {
  return ensureState().sevas;
}
export function getEvents(): TempleEvent[] {
  return ensureState().events;
}
export function getAnnouncements(): Announcement[] {
  return ensureState().announcements;
}

/** All bookings (admin view + availability), soonest first. */
export function allBookings(): Booking[] {
  return [...ensureState().bookings].sort((a, b) =>
    a.date === b.date ? (a.time < b.time ? -1 : 1) : a.date < b.date ? -1 : 1,
  );
}

/** Bookings created on this device (devotee's "My Bookings"). */
export function myDeviceBookings(): Booking[] {
  const s = ensureState();
  const mine = new Set(s.myCodes);
  return s.bookings
    .filter((b) => mine.has(b.bookingCode))
    .sort((a, b) => (a.date === b.date ? (a.time < b.time ? -1 : 1) : a.date < b.date ? -1 : 1));
}

/** All donations, newest first. */
export function allDonations(): Donation[] {
  return [...ensureState().donations].sort((a, b) =>
    a.createdAt === b.createdAt ? 0 : a.createdAt < b.createdAt ? 1 : -1,
  );
}

/** Donations created on this device (devotee's history). */
export function myDeviceDonations(): Donation[] {
  const s = ensureState();
  const mine = new Set(s.myReceipts);
  return s.donations
    .filter((d) => mine.has(d.receiptNo))
    .sort((a, b) => (a.createdAt === b.createdAt ? 0 : a.createdAt < b.createdAt ? 1 : -1));
}

/** Bookings created on this device (persisted locally) — excludes seed demos. */
export function loadLocalBookings(): Booking[] {
  const s = ensureState();
  return s.bookings.filter((b) => !SEED_BOOKING_IDS.has(b.id));
}

/** Donations created on this device (persisted locally) — excludes seed demos. */
export function loadLocalDonations(): Donation[] {
  const s = ensureState();
  return s.donations.filter((d) => !SEED_DONATION_IDS.has(d.id));
}

/** Next major event for the home-screen countdown. */
export function nextMajorEvent(fromDate: string): TempleEvent | null {
  const upcoming = getEvents()
    .filter((e) => e.date >= fromDate)
    .sort((a, b) => (a.date < b.date ? -1 : 1));
  return upcoming[0] ?? null;
}

/** Real availability: confirmed bookings in the store for a slot. */
export function getSlotBooked(sevaId: string, date: string, time: string): number {
  const s = ensureState();
  const seva = s.sevas.find((x) => x.id === sevaId);
  if (!seva) return 0;
  const n = s.bookings.filter(
    (b) => b.sevaId === sevaId && b.date === date && b.time === time && b.status === 'confirmed',
  ).length;
  return Math.min(seva.capacity, n);
}

export function seatsLeft(sevaId: string, date: string, time: string): number {
  const seva = ensureState().sevas.find((x) => x.id === sevaId);
  if (!seva) return 0;
  return Math.max(0, seva.capacity - getSlotBooked(sevaId, date, time));
}

export function findBookingByCode(code: string): Booking | null {
  return ensureState().bookings.find((b) => b.bookingCode === code) ?? null;
}

export function findDonationByReceipt(receiptNo: string): Donation | null {
  return ensureState().donations.find((d) => d.receiptNo === receiptNo) ?? null;
}

/* ============================ writes (async) ============================ */

function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export interface NewBookingInput {
  sevaId: string;
  date: string;
  time: string;
  devoteeName: string;
  phone: string;
  place: string;
  note?: string;
  payMode: 'online' | 'payAtTemple';
  /** Admin-created bookings can record payment collected on the spot. */
  paymentStatus?: 'unpaid' | 'paid';
  /** Name of the admin who collected/marked the payment. */
  paidBy?: string;
}

export async function createBooking(input: NewBookingInput): Promise<Booking> {
  const s = ensureState();
  const seva = s.sevas.find((x) => x.id === input.sevaId);
  if (!seva) throw new Error(`unknown seva ${input.sevaId}`);
  if (!input.devoteeName.trim()) throw new Error('name required');
  if (!input.place.trim()) throw new Error('place required');
  // No per-slot booking limit (user decision 2026-10-08): slots never fill up.
  const codePrefix = `SDP-${input.date.replace(/-/g, '')}`;
  const maxSeq = s.bookings
    .filter((b) => b.bookingCode.startsWith(codePrefix))
    .map((b) => parseInt(b.bookingCode.slice(-3), 10))
    .filter((n) => Number.isFinite(n))
    .reduce((m, n) => Math.max(m, n), 0);
  const seq = String(maxSeq + 1).padStart(3, '0');
  const booking: Booking = {
    id: newId('b'),
    bookingCode: `${codePrefix}-${seq}`,
    sevaId: input.sevaId,
    sevaName: seva.name,
    date: input.date,
    time: input.time,
    devoteeName: input.devoteeName.trim(),
    phone: input.phone.replace(/\D/g, '').slice(-10),
    place: input.place.trim(),
    note: input.note?.trim() || undefined,
    payMode: input.payMode,
    status: 'confirmed',
    paymentStatus: input.paymentStatus ?? 'unpaid',
    paidBy: input.paymentStatus === 'paid' ? input.paidBy?.trim() || undefined : undefined,
    paidAt:
      input.paymentStatus === 'paid'
        ? new Date().toISOString().slice(0, 10)
        : undefined,
    createdAt: new Date().toISOString().slice(0, 10),
  };
  // Persist first: a failed write must not leave a phantom booking in state.
  if (backend === 'firestore') {
    await fsSet('bookings', booking.id, booking);
  }
  s.bookings.push(booking);
  s.myCodes.push(booking.bookingCode);
  if (backend === 'firestore') {
    try {
      localStorage.setItem(MY_CODES_KEY, JSON.stringify(s.myCodes));
    } catch {
      /* ignore */
    }
  } else {
    persistLocal();
  }
  return booking;
}

async function setBookingStatus(id: string, status: Booking['status']): Promise<boolean> {
  const s = ensureState();
  const ix = s.bookings.findIndex((b) => b.id === id);
  if (ix < 0) return false;
  const updated = { ...s.bookings[ix], status };
  if (backend === 'firestore') await fsSet('bookings', id, updated);
  else persistLocal();
  s.bookings[ix] = updated;
  return true;
}

export async function cancelBooking(id: string): Promise<boolean> {
  return setBookingStatus(id, 'cancelled');
}

export async function completeBooking(id: string): Promise<boolean> {
  return setBookingStatus(id, 'completed');
}

/** Admin marks a booking paid/unpaid after the devotee pays via UPI/cash.
 *  Records which admin marked it and when. */
export async function setPaymentStatus(
  id: string,
  paymentStatus: 'unpaid' | 'paid',
  paidBy?: string,
): Promise<boolean> {
  const s = ensureState();
  const ix = s.bookings.findIndex((b) => b.id === id);
  if (ix < 0) return false;
  const today = new Date().toISOString().slice(0, 10);
  const updated: Booking = {
    ...s.bookings[ix],
    paymentStatus,
    paidBy: paymentStatus === 'paid' ? paidBy?.trim() || undefined : undefined,
    paidAt: paymentStatus === 'paid' ? today : undefined,
  };
  if (backend === 'firestore') await fsSet('bookings', id, updated);
  else persistLocal();
  s.bookings[ix] = updated;
  return true;
}

export interface NewDonationInput {
  devoteeName: string;
  phone: string;
  email?: string;
  amount: number;
  purpose: Donation['purpose'];
  note?: string;
  anonymous: boolean;
  mode: 'online' | 'offline';
}

export async function createDonation(input: NewDonationInput): Promise<Donation> {
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error('invalid amount');
  }
  const s = ensureState();
  const year = new Date().getFullYear();
  const receiptPrefix = `SDP-D-${year}`;
  const maxSeq = s.donations
    .filter((d) => d.receiptNo.startsWith(receiptPrefix))
    .map((d) => parseInt(d.receiptNo.slice(-4), 10))
    .filter((n) => Number.isFinite(n))
    .reduce((m, n) => Math.max(m, n), 0);
  const seq = String(maxSeq + 1).padStart(4, '0');
  const donation: Donation = {
    id: newId('d'),
    devoteeName: input.anonymous ? 'Anonymous' : input.devoteeName.trim(),
    phone: input.phone.replace(/\D/g, '').slice(-10),
    email: input.email?.trim() || undefined,
    amount: Math.round(input.amount),
    purpose: input.purpose,
    note: input.note?.trim() || undefined,
    anonymous: input.anonymous,
    mode: input.mode,
    receiptNo: `${receiptPrefix}-${seq}`,
    createdAt: new Date().toISOString().slice(0, 10),
  };
  // Persist first: a failed write must not leave a phantom donation in state.
  if (backend === 'firestore') {
    await fsSet('donations', donation.id, donation);
  }
  s.donations.push(donation);
  s.myReceipts.push(donation.receiptNo);
  if (backend === 'firestore') {
    try {
      localStorage.setItem(MY_RECEIPTS_KEY, JSON.stringify(s.myReceipts));
    } catch {
      /* ignore */
    }
  } else {
    persistLocal();
  }
  return donation;
}

/* ---------------- admin content writes ---------------- */

export async function saveTempleProfile(profile: TempleProfile): Promise<void> {
  const s = ensureState();
  s.profile = profile;
  if (backend === 'firestore') await fsSet('templeProfile', 'config', profile);
  else persistLocal();
}

/* ---------------- expenses (admin-only) ---------------- */

/** All non-deleted expenses by default, newest first. */
export function getExpenses(includeDeleted = false): Expense[] {
  return ensureState()
    .expenses.filter((e) => includeDeleted || !e.deleted)
    .sort((a, b) => (a.date === b.date ? (a.id < b.id ? 1 : -1) : a.date < b.date ? 1 : -1));
}

export function getExpense(id: string): Expense | undefined {
  return ensureState().expenses.find((e) => e.id === id);
}

export function getExpenseCategories(includeInactive = false): ExpenseCategory[] {
  return ensureState()
    .expenseCategories.filter((c) => includeInactive || c.active)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function persistExpensesLocal(): void {
  if (backend === 'firestore') return;
  try {
    const s = ensureState();
    localStorage.setItem(LOCAL_EXPENSES_KEY, JSON.stringify(s.expenses));
    localStorage.setItem(LOCAL_EXPENSE_CATS_KEY, JSON.stringify(s.expenseCategories));
  } catch {
    /* ignore */
  }
}

export async function saveExpenseCategory(input: {
  id?: string;
  name: string;
  active?: boolean;
}): Promise<ExpenseCategory> {
  const name = input.name.trim();
  if (!name) throw new Error('name required');
  const s = ensureState();
  const dup = s.expenseCategories.find(
    (c) => c.name.toLowerCase() === name.toLowerCase() && c.id !== input.id,
  );
  if (dup) throw new Error('category exists');
  let cat: ExpenseCategory;
  if (input.id) {
    const ix = s.expenseCategories.findIndex((c) => c.id === input.id);
    if (ix < 0) throw new Error('unknown category');
    cat = { ...s.expenseCategories[ix], name, active: input.active ?? true };
    // Persist first: a failed write must not leave a phantom category in state.
    if (backend === 'firestore') await fsSet('expenseCategories', cat.id, cat);
    s.expenseCategories[ix] = cat;
  } else {
    cat = { id: newId('cat'), name, active: true, createdAt: new Date().toISOString().slice(0, 10) };
    if (backend === 'firestore') await fsSet('expenseCategories', cat.id, cat);
    s.expenseCategories.push(cat);
  }
  persistExpensesLocal();
  return cat;
}

export async function deleteExpenseCategory(id: string): Promise<void> {
  const s = ensureState();
  // Denormalized categoryName on expenses preserves history; safe to remove.
  if (backend === 'firestore') await fsDelete('expenseCategories', id);
  s.expenseCategories = s.expenseCategories.filter((c) => c.id !== id);
  persistExpensesLocal();
}

export async function saveExpense(
  input: NewExpenseInput & { id?: string },
  adminName?: string,
): Promise<Expense> {
  if (!Number.isFinite(input.amount) || input.amount <= 0) throw new Error('invalid amount');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) throw new Error('invalid date');
  if (!input.paidTo.trim()) throw new Error('paid-to required');
  const s = ensureState();
  const cat =
    s.expenseCategories.find((c) => c.id === input.categoryId) ??
    s.expenseCategories.find((c) => c.name === 'Other');
  const isOther = cat?.name.toLowerCase() === 'other';
  if (isOther && !input.customNote?.trim()) throw new Error('note required for Other');
  const today = new Date().toISOString().slice(0, 10);
  let expense: Expense;
  if (input.id) {
    const ix = s.expenses.findIndex((e) => e.id === input.id);
    if (ix < 0) throw new Error('unknown expense');
    const prev = s.expenses[ix];
    expense = {
      ...prev,
      date: input.date,
      categoryId: cat?.id ?? prev.categoryId,
      categoryName: cat?.name ?? prev.categoryName,
      amount: Math.round(input.amount),
      paymentMode: input.paymentMode,
      paidTo: input.paidTo.trim(),
      vendorPhone: input.vendorPhone?.replace(/\D/g, '').slice(-10) || undefined,
      invoiceNo: input.invoiceNo?.trim() || undefined,
      note: input.note?.trim() || undefined,
      receiptDataUrl: input.receiptDataUrl || undefined,
      customNote: input.customNote?.trim() || undefined,
      updatedBy: adminName,
      updatedAt: today,
    };
    // Persist first: a failed write must not leave a phantom expense in state.
    if (backend === 'firestore') await fsSet('expenses', expense.id, expense);
    s.expenses[ix] = expense;
  } else {
    expense = {
      id: newId('exp'),
      date: input.date,
      categoryId: cat?.id ?? 'cat-26',
      categoryName: cat?.name ?? 'Other',
      amount: Math.round(input.amount),
      paymentMode: input.paymentMode,
      paidTo: input.paidTo.trim(),
      vendorPhone: input.vendorPhone?.replace(/\D/g, '').slice(-10) || undefined,
      invoiceNo: input.invoiceNo?.trim() || undefined,
      note: input.note?.trim() || undefined,
      receiptDataUrl: input.receiptDataUrl || undefined,
      customNote: input.customNote?.trim() || undefined,
      deleted: false,
      createdBy: adminName,
      createdAt: today,
    };
    if (backend === 'firestore') await fsSet('expenses', expense.id, expense);
    s.expenses.push(expense);
  }
  persistExpensesLocal();
  return expense;
}

/** Soft delete: hidden from default views, kept for audit. */
export async function softDeleteExpense(id: string, adminName?: string): Promise<void> {
  const s = ensureState();
  const ix = s.expenses.findIndex((e) => e.id === id);
  if (ix < 0) throw new Error('unknown expense');
  const expense = {
    ...s.expenses[ix],
    deleted: true,
    deletedBy: adminName,
    deletedAt: new Date().toISOString().slice(0, 10),
  };
  if (backend === 'firestore') await fsSet('expenses', id, expense);
  s.expenses[ix] = expense;
  persistExpensesLocal();
}

export async function restoreExpense(id: string, adminName?: string): Promise<void> {
  const s = ensureState();
  const ix = s.expenses.findIndex((e) => e.id === id);
  if (ix < 0) throw new Error('unknown expense');
  const expense = {
    ...s.expenses[ix],
    deleted: false,
    updatedBy: adminName,
    updatedAt: new Date().toISOString().slice(0, 10),
  };
  if (backend === 'firestore') await fsSet('expenses', id, expense);
  s.expenses[ix] = expense;
  persistExpensesLocal();
}

export interface ExpenseSummary {
  from: string;
  to: string;
  total: number;
  count: number;
  avgPerDay: number;
  days: number;
  byCategory: { name: string; total: number; count: number }[];
}

/** Aggregate non-deleted expenses in [from, to] (inclusive, YYYY-MM-DD). */
export function expenseSummary(from: string, to: string): ExpenseSummary {
  const list = getExpenses().filter((e) => e.date >= from && e.date <= to);
  const total = list.reduce((n, e) => n + e.amount, 0);
  const days = Math.max(
    1,
    Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86400000) + 1,
  );
  const byCat = new Map<string, { total: number; count: number }>();
  for (const e of list) {
    const cur = byCat.get(e.categoryName) ?? { total: 0, count: 0 };
    cur.total += e.amount;
    cur.count += 1;
    byCat.set(e.categoryName, cur);
  }
  const byCategory = [...byCat.entries()]
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.total - a.total);
  return { from, to, total, count: list.length, avgPerDay: Math.round(total / days), days, byCategory };
}

/** Quarter (Q1-Q4) date range for a YYYY-MM-DD anchor. */
export function quarterRange(anchor: string): { start: string; end: string; label: string } {
  const [y, m] = anchor.split('-').map(Number);
  const q = Math.floor((m - 1) / 3);
  const sm = String(q * 3 + 1).padStart(2, '0');
  const em = String(q * 3 + 3).padStart(2, '0');
  const lastDay = new Date(y, q * 3 + 3, 0).getDate();
  return {
    start: `${y}-${sm}-01`,
    end: `${y}-${em}-${String(lastDay).padStart(2, '0')}`,
    label: `Q${q + 1} ${y}`,
  };
}

export async function saveSeva(seva: Seva): Promise<void> {
  const s = ensureState();
  const ix = s.sevas.findIndex((x) => x.id === seva.id);
  if (ix >= 0) s.sevas[ix] = seva;
  else s.sevas.push(seva);
  if (backend === 'firestore') await fsSet('sevas', seva.id, seva);
  else persistLocal();
}

export async function saveEvent(event: TempleEvent): Promise<void> {
  const s = ensureState();
  const ix = s.events.findIndex((e) => e.id === event.id);
  if (ix >= 0) s.events[ix] = event;
  else s.events.push(event);
  if (backend === 'firestore') await fsSet('events', event.id, event);
  else persistLocal();
}

export async function deleteEvent(id: string): Promise<void> {
  const s = ensureState();
  s.events = s.events.filter((e) => e.id !== id);
  if (backend === 'firestore') await fsDelete('events', id);
  else persistLocal();
}

export async function addAnnouncement(a: Announcement): Promise<void> {
  const s = ensureState();
  s.announcements.unshift(a);
  if (backend === 'firestore') await fsSet('announcements', a.id, a);
  else persistLocal();
}

export async function deleteAnnouncement(id: string): Promise<void> {
  const s = ensureState();
  s.announcements = s.announcements.filter((a) => a.id !== id);
  if (backend === 'firestore') await fsDelete('announcements', id);
  else persistLocal();
}

/* ---------------- admin users (created by the super user) ---------------- */

const ADMIN_SESSION_KEY = 'temple-admin-session';

export interface AdminSession {
  phone: string;
  name: string;
  role: 'super' | 'admin';
}

/** SHA-256 hash of a PIN (never store or transmit the raw PIN). */
export async function hashPin(pin: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(`temple-admin-pin:${pin}`),
  );
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** True once at least one admin exists (otherwise the gate shows first-run setup). */
export function hasAnyAdmin(): boolean {
  return ensureState().admins.length > 0;
}

export function getAdmins(): AdminUser[] {
  return [...ensureState().admins].sort((a, b) => (a.phone < b.phone ? -1 : 1));
}

export interface NewAdminInput {
  name: string;
  phone: string;
  pin: string;
  role: 'super' | 'admin';
}

/** Create an admin user. Phone numbers are unique (used as the record id). */
export async function createAdminUser(input: NewAdminInput): Promise<AdminUser> {
  const phone = input.phone.replace(/\D/g, '').slice(-10);
  if (phone.length !== 10) throw new Error('phone must be 10 digits');
  if (!input.name.trim()) throw new Error('name required');
  if (input.pin.length < 4) throw new Error('PIN must be at least 4 digits');
  if (input.role !== 'super' && input.role !== 'admin') throw new Error('invalid role');
  const s = ensureState();
  if (s.admins.some((a) => a.phone === phone)) throw new Error('phone already registered');
  const admin: AdminUser = {
    phone,
    name: input.name.trim(),
    pinHash: await hashPin(input.pin),
    role: input.role,
    active: true,
    createdAt: new Date().toISOString().slice(0, 10),
  };
  if (backend === 'firestore') await fsSet('admins', phone, admin);
  s.admins.push(admin);
  if (backend !== 'firestore') persistLocal();
  return admin;
}

export async function setAdminActive(phone: string, active: boolean): Promise<boolean> {
  const s = ensureState();
  const ix = s.admins.findIndex((a) => a.phone === phone);
  if (ix < 0) return false;
  const updated = { ...s.admins[ix], active };
  if (backend === 'firestore') await fsSet('admins', phone, updated);
  s.admins[ix] = updated;
  if (backend !== 'firestore') persistLocal();
  return true;
}

/** Verify phone + PIN. Returns the admin on success, null otherwise. */
export async function verifyAdminLogin(phone: string, pin: string): Promise<AdminUser | null> {
  const digits = phone.replace(/\D/g, '').slice(-10);
  const admin = ensureState().admins.find((a) => a.phone === digits && a.active);
  if (!admin) return null;
  const hash = await hashPin(pin);
  if (hash !== admin.pinHash) return null;
  const session: AdminSession = { phone: admin.phone, name: admin.name, role: admin.role };
  try {
    sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
  } catch {
    /* ignore */
  }
  return admin;
}

export function currentAdmin(): AdminSession | null {
  try {
    const raw = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as AdminSession;
    return s && s.phone ? s : null;
  } catch {
    return null;
  }
}

export function isAdminAuthed(): boolean {
  return currentAdmin() !== null;
}

export function isSuperAdmin(): boolean {
  return currentAdmin()?.role === 'super';
}

export function adminLogout(): void {
  try {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
  } catch {
    /* ignore */
  }
}

/* ---------------- collections report ---------------- */

export interface SevaCollectionRow {
  sevaId: string;
  sevaName: { en: string; kn: string };
  price: number;
  bookings: number;
  paidCount: number;
  unpaidCount: number;
  collected: number; // paidCount * price
  pending: number; // unpaidCount * price
}

export interface CollectionReport {
  from: string;
  to: string;
  rows: SevaCollectionRow[];
  totalBookings: number;
  totalCollected: number;
  totalPending: number;
  donationsTotal: number;
  grandCollected: number; // seva collected + donations
}

/** Seva-wise booking/payment totals plus donations for a date range (excludes cancelled). */
export function collectionReport(from: string, to: string): CollectionReport {
  const s = ensureState();
  const priceOf = new Map(s.sevas.map((sv) => [sv.id, sv.price]));
  const nameOf = new Map(s.sevas.map((sv) => [sv.id, sv.name]));
  const bySeva = new Map<string, SevaCollectionRow>();

  for (const b of s.bookings) {
    if (b.status === 'cancelled' || b.date < from || b.date > to) continue;
    let row = bySeva.get(b.sevaId);
    if (!row) {
      row = {
        sevaId: b.sevaId,
        sevaName: nameOf.get(b.sevaId) ?? b.sevaName,
        price: priceOf.get(b.sevaId) ?? 0,
        bookings: 0,
        paidCount: 0,
        unpaidCount: 0,
        collected: 0,
        pending: 0,
      };
      bySeva.set(b.sevaId, row);
    }
    row.bookings += 1;
    if (b.paymentStatus === 'paid') {
      row.paidCount += 1;
      row.collected += row.price;
    } else {
      row.unpaidCount += 1;
      row.pending += row.price;
    }
  }

  const rows = [...bySeva.values()].sort((a, b) =>
    a.sevaName.en < b.sevaName.en ? -1 : 1,
  );
  const donationsTotal = s.donations
    .filter((d) => d.createdAt >= from && d.createdAt <= to)
    .reduce((n, d) => n + d.amount, 0);
  const totalCollected = rows.reduce((n, r) => n + r.collected, 0);
  const totalPending = rows.reduce((n, r) => n + r.pending, 0);
  return {
    from,
    to,
    rows,
    totalBookings: rows.reduce((n, r) => n + r.bookings, 0),
    totalCollected,
    totalPending,
    donationsTotal,
    grandCollected: totalCollected + donationsTotal,
  };
}

/* ---------------- seva payment receipts ---------------- */

/** Next sequential seva receipt number, e.g. SDP-R-2026-0001. */
export function nextSevaReceiptNo(): string {
  const s = ensureState();
  const year = new Date().getFullYear();
  const prefix = `SDP-R-${year}-`;
  let max = 0;
  for (const b of s.bookings) {
    const m = b.receiptNo?.match(/^SDP-R-(\d{4})-(\d{4})$/);
    if (m && m[1] === String(year)) max = Math.max(max, Number(m[2]));
  }
  return `${prefix}${String(max + 1).padStart(4, '0')}`;
}

/**
 * Issue (or re-fetch) the payment receipt number for a paid booking.
 * The number is generated once and stored so reprints stay identical.
 */
export async function issueSevaReceipt(id: string): Promise<string | null> {
  const s = ensureState();
  const ix = s.bookings.findIndex((b) => b.id === id);
  if (ix < 0) return null;
  const b = s.bookings[ix];
  if (b.paymentStatus !== 'paid') return null;
  if (b.receiptNo) return b.receiptNo;
  const receiptNo = nextSevaReceiptNo();
  const updated = { ...b, receiptNo };
  if (backend === 'firestore') await fsSet('bookings', id, updated);
  else persistLocal();
  s.bookings[ix] = updated;
  return receiptNo;
}

/* ---------------- week helpers (Monday..Sunday) ---------------- */

function isoOf(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Monday..Sunday week containing the given date (week ends Sunday). */
export function weekRange(dateStr: string): { start: string; end: string } {
  const d = new Date(`${dateStr}T12:00:00`);
  const diffToMon = (d.getDay() + 6) % 7;
  const mon = new Date(d);
  mon.setDate(d.getDate() - diffToMon);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  return { start: isoOf(mon), end: isoOf(sun) };
}

/** First..last day of the month containing the given date. */
export function monthRange(dateStr: string): { start: string; end: string } {
  const d = new Date(`${dateStr}T12:00:00`);
  const first = new Date(d.getFullYear(), d.getMonth(), 1);
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return { start: isoOf(first), end: isoOf(last) };
}

/** All bookings in a date range, grouped by date (ascending). */
export function bookingsByDate(
  start: string,
  end: string,
): { date: string; bookings: Booking[] }[] {
  const map = new Map<string, Booking[]>();
  for (const b of ensureState().bookings) {
    if (b.date < start || b.date > end) continue;
    const list = map.get(b.date) ?? [];
    list.push(b);
    map.set(b.date, list);
  }
  return [...map.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([date, bookings]) => ({
      date,
      bookings: bookings.sort((x, y) => (x.time < y.time ? -1 : 1)),
    }));
}

/** Dashboard stats for the admin home. */
export function adminStats(today: string): {
  donationsToday: number;
  bookingsToday: number;
  pendingCount: number;
  activeSevas: number;
  upcomingEvents: number;
} {
  const s = ensureState();
  const donationsToday = s.donations
    .filter((d) => d.createdAt === today)
    .reduce((sum, d) => sum + d.amount, 0);
  const todaysBookings = s.bookings.filter((b) => b.date === today && b.status === 'confirmed');
  const pendingCount = s.bookings.filter(
    (b) => b.status === 'confirmed' && b.paymentStatus === 'unpaid' && b.date >= today,
  ).length;
  return {
    donationsToday,
    bookingsToday: todaysBookings.length,
    pendingCount,
    activeSevas: s.sevas.filter((x) => x.active).length,
    upcomingEvents: s.events.filter((e) => e.date >= today).length,
  };
}
