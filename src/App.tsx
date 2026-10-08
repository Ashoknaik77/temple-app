import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { LanguageProvider } from './i18n';
import { initData } from './data/mock';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './screens/HomeScreen';
import { SevaListScreen } from './screens/SevaListScreen';
import { SevaDetailScreen } from './screens/SevaDetailScreen';
import { BookingFormScreen } from './screens/BookingFormScreen';
import { BookingDetailScreen } from './screens/BookingDetailScreen';
import { MyBookingsScreen } from './screens/MyBookingsScreen';
import { DonateScreen } from './screens/DonateScreen';
import { DonationReceiptScreen } from './screens/DonationReceiptScreen';
import { DonationHistoryScreen } from './screens/DonationHistoryScreen';
import { MoreScreen } from './screens/MoreScreen';
import { AdminGate, RequireAdmin } from './screens/admin/AdminGate';
import { AdminDashboardScreen } from './screens/admin/AdminDashboardScreen';
import { AdminSevasScreen } from './screens/admin/AdminSevasScreen';
import { AdminSevaFormScreen } from './screens/admin/AdminSevaFormScreen';
import { AdminEventsScreen } from './screens/admin/AdminEventsScreen';
import { AdminEventFormScreen } from './screens/admin/AdminEventFormScreen';
import { AdminBookingsScreen } from './screens/admin/AdminBookingsScreen';
import { AdminBookingFormScreen } from './screens/admin/AdminBookingFormScreen';
import { AdminDonationsScreen } from './screens/admin/AdminDonationsScreen';
import { EventsScreen } from './screens/EventsScreen';
import { TimingsScreen } from './screens/TimingsScreen';
import { ContactScreen } from './screens/ContactScreen';
import { AdminAnnouncementsScreen } from './screens/admin/AdminAnnouncementsScreen';
import { AdminUsersScreen } from './screens/admin/AdminUsersScreen';
import { AdminReportsScreen } from './screens/admin/AdminReportsScreen';
import { AdminProfileScreen } from './screens/admin/AdminProfileScreen';
import { PlaceholderScreen } from './screens/PlaceholderScreen';

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let on = true;
    initData()
      .catch(() => {})
      .finally(() => {
        if (on) setReady(true);
      });
    return () => {
      on = false;
    };
  }, []);

  if (!ready) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center bg-[#faf7f2]">
        <div className="text-6xl" aria-hidden>
          🛕
        </div>
        <p className="mt-4 text-lg font-bold text-stone-800">ಶ್ರೀ ದುರ್ಗಾ ಪರಮೇಶ್ವರಿ</p>
        <p className="mt-1 text-sm text-stone-500">Loading…</p>
      </div>
    );
  }

  return (
    <LanguageProvider>
      <BrowserRouter>
        <div className="mx-auto min-h-screen max-w-lg bg-[#faf7f2]">
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/sevas" element={<SevaListScreen />} />
            <Route path="/sevas/:sevaId" element={<SevaDetailScreen />} />
            <Route path="/sevas/:sevaId/book" element={<BookingFormScreen />} />
            <Route path="/bookings" element={<MyBookingsScreen />} />
            <Route path="/bookings/:code" element={<BookingDetailScreen />} />
            <Route path="/donate" element={<DonateScreen />} />
            <Route path="/donations" element={<DonationHistoryScreen />} />
            <Route path="/donations/:receiptNo" element={<DonationReceiptScreen />} />
            <Route path="/events" element={<EventsScreen />} />
            <Route path="/timings" element={<TimingsScreen />} />
            <Route path="/contact" element={<ContactScreen />} />
            <Route path="/darshan" element={<PlaceholderScreen titleKey="liveDarshan" />} />
            <Route path="/gallery" element={<PlaceholderScreen titleKey="gallery" />} />
            <Route path="/more" element={<MoreScreen />} />
            <Route path="/admin" element={<AdminGate />} />
            <Route element={<RequireAdmin />}>
              <Route path="/admin/dashboard" element={<AdminDashboardScreen />} />
              <Route path="/admin/sevas" element={<AdminSevasScreen />} />
              <Route path="/admin/sevas/new" element={<AdminSevaFormScreen />} />
              <Route path="/admin/sevas/:id" element={<AdminSevaFormScreen />} />
              <Route path="/admin/events" element={<AdminEventsScreen />} />
              <Route path="/admin/events/new" element={<AdminEventFormScreen />} />
              <Route path="/admin/events/:id" element={<AdminEventFormScreen />} />
              <Route path="/admin/bookings" element={<AdminBookingsScreen />} />
              <Route path="/admin/bookings/new" element={<AdminBookingFormScreen />} />
              <Route path="/admin/donations" element={<AdminDonationsScreen />} />
              <Route path="/admin/announcements" element={<AdminAnnouncementsScreen />} />
              <Route path="/admin/users" element={<AdminUsersScreen />} />
              <Route path="/admin/reports" element={<AdminReportsScreen />} />
              <Route path="/admin/profile" element={<AdminProfileScreen />} />
            </Route>
            <Route path="*" element={<PlaceholderScreen titleKey="home" />} />
          </Routes>
          <BottomNav />
        </div>
      </BrowserRouter>
    </LanguageProvider>
  );
}
