import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { LanguageProvider } from './i18n';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './screens/HomeScreen';
import { PlaceholderScreen } from './screens/PlaceholderScreen';

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter basename="/temple-app">
        <div className="mx-auto min-h-screen max-w-lg bg-[#faf7f2]">
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/sevas" element={<PlaceholderScreen titleKey="generalSevaList" />} />
            <Route path="/donate" element={<PlaceholderScreen titleKey="donateTitle" />} />
            <Route path="/events" element={<PlaceholderScreen titleKey="upcomingEvents" />} />
            <Route path="/timings" element={<PlaceholderScreen titleKey="dailyTimings" />} />
            <Route path="/contact" element={<PlaceholderScreen titleKey="contactTemple" />} />
            <Route path="/darshan" element={<PlaceholderScreen titleKey="liveDarshan" />} />
            <Route path="/gallery" element={<PlaceholderScreen titleKey="gallery" />} />
            <Route path="/bookings" element={<PlaceholderScreen titleKey="myBookings" />} />
            <Route path="/more" element={<PlaceholderScreen titleKey="more" />} />
            <Route path="*" element={<PlaceholderScreen titleKey="home" />} />
          </Routes>
          <BottomNav />
        </div>
      </BrowserRouter>
    </LanguageProvider>
  );
}
