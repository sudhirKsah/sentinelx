import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Layout
import MainLayout from './components/Layout/MainLayout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Overview from './pages/Overview';
import Events from './pages/Events';
import Alerts from './pages/Alerts';
import Incidents from './pages/Incidents';
import Infrastructure from './pages/Infrastructure';
import Rules from './pages/Rules';
import Users from './pages/Users';
import Containers from './pages/Containers';
import AiAnalytics from './pages/AiAnalytics';
import Compliance from './pages/Compliance';
import Settings from './pages/Settings';

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes wrapped in MainLayout */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/overview" element={<Overview />} />
          <Route path="/events" element={<Events />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/incidents" element={<Incidents />} />
          <Route path="/infrastructure" element={<Infrastructure />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/users" element={<Users />} />
          <Route path="/containers" element={<Containers />} />
          <Route path="/analytics" element={<AiAnalytics />} />
          <Route path="/compliance" element={<Compliance />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
