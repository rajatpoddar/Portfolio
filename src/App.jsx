import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LangProvider } from './i18n/LangContext';
import { ToastProvider } from './components/ui/Toast';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Public pages
import PublicSite from './pages/PublicSite';
import Login from './pages/Login';

// Dashboard
import DashboardLayout from './pages/dashboard/DashboardLayout';
import Overview from './pages/dashboard/Overview';
import Clients from './pages/dashboard/Clients';
import Quotes from './pages/dashboard/Quotes';
import Invoices from './pages/dashboard/Invoices';
import Leads from './pages/dashboard/Leads';
import PricingSettings from './pages/dashboard/PricingSettings';

export default function App() {
  return (
    <ThemeProvider>
      <LangProvider>
        <ToastProvider>
          <AuthProvider>
            <BrowserRouter>
            <Routes>
              {/* Public */}
              <Route path="/" element={<PublicSite />} />
              <Route path="/login" element={<Login />} />

              {/* Protected dashboard */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Overview />} />
                <Route path="clients" element={<Clients />} />
                <Route path="quotes" element={<Quotes />} />
                <Route path="invoices" element={<Invoices />} />
                <Route path="leads" element={<Leads />} />
                <Route path="pricing" element={<PricingSettings />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </LangProvider>
  </ThemeProvider>
  );
}
