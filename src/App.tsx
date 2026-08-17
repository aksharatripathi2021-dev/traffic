import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { CitizenLayout, PoliceLayout } from './layouts/CitizenLayout';
import { MainLayout } from './layouts/MainLayout';
import { LandingPage } from './pages/LandingPage';
import { CitizenLoginPage } from './pages/citizen/CitizenLoginPage';
import { CitizenDashboard } from './pages/citizen/CitizenDashboard';
import { CitizenReportPage } from './pages/citizen/CitizenReportPage';
import { PoliceLoginPage } from './pages/police/PoliceLoginPage';
import { PoliceDashboard } from './pages/police/PoliceDashboard';
import { PoliceZoneDetail } from './pages/police/PoliceZoneDetail';
import { useMockData } from './hooks/useMockData';

function AppContent() {
  const { resetData } = useMockData();

  return (
    <Routes>
      <Route element={<MainLayout onResetData={resetData} />}>
        <Route path="/" element={<LandingPage />} />
      </Route>

      <Route element={<CitizenLayout onResetData={resetData} />}>
        <Route path="/citizen/login" element={<CitizenLoginPage />} />
        <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
        <Route path="/citizen/report" element={<CitizenReportPage />} />
      </Route>

      <Route element={<PoliceLayout onResetData={resetData} />}>
        <Route path="/police/login" element={<PoliceLoginPage />} />
        <Route path="/police/dashboard" element={<PoliceDashboard />} />
        <Route path="/police/zone/:zoneId" element={<PoliceZoneDetail />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
