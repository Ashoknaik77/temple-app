import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { LanguageProvider } from './i18n';
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
import { AdminDonationsScreen } from './screens/admin/AdminDonationsScreen';
import { AdminAnnouncementsScreen } from './screens/admin/AdminAnnouncementsScreen';
import { AdminProfileScreen } from './screens/admin/AdminProfileScreen';
import { PlaceholderScreen } from './screens/PlaceholderScreen';

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter basename="/temple-app">
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
            <Route path="/events" element={<PlaceholderScreen titleKey="upcomingEvents" />} />
            <Route path="/timings" element={<PlaceholderScreen titleKey="dailyTimings" />} />
            <Route path="/contact" element={<PlaceholderScreen titleKey="contactTemple" />} />
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
              <Route path="/admin/donations" element={<AdminDonationsScreen />} />
              <Route path="/admin/announcements" element={<AdminAnnouncementsScreen />} />
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
