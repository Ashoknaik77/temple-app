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
            <Route path="/more" element={<PlaceholderScreen titleKey="more" />} />
            <Route path="*" element={<PlaceholderScreen titleKey="home" />} />
          </Routes>
          <BottomNav />
        </div>
      </BrowserRouter>
    </LanguageProvider>
  );
}
