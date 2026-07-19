import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';

// Components
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Profile from './pages/Profile';
import Weight from './pages/Weight';
import Body from './pages/Body';
import Strength from './pages/Strength';
import WorkoutHistory from './pages/WorkoutHistory';
import Schedules from './pages/Schedules';
import DailyTargets from './pages/DailyTargets';
import Cardio from './pages/Cardio';
import ProgressCharts from './pages/ProgressCharts';
import Reminders from './pages/Reminders';
import Leaderboard from './pages/Leaderboard';

// Role-specific Dashboards
import AdminDashboard from './pages/admin/Dashboard';
import AdminClients from './pages/admin/Clients';
import ClientDashboard from './pages/client/Dashboard';

export default function App() {
  const { isAuthenticated, fetchMe, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchMe();
    }
  }, [isAuthenticated]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Route */}
        <Route path="/login" element={<Login />} />

        {/* Private Dashboard Wrapper */}
        <Route path="/" element={<Layout />}>
          {/* Default Routing Redirects depending on Auth Role */}
          <Route
            index
            element={
              user?.role === 'ADMIN' ? (
                <Navigate to="/admin" replace />
              ) : (
                <Navigate to="/client" replace />
              )
            }
          />

          {/* PT/Admin Specific Pages */}
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="admin/clients" element={<AdminClients />} />
          <Route path="admin/weight" element={<Weight />} />
          <Route path="admin/body" element={<Body />} />
          <Route path="admin/strength" element={<Strength />} />
          <Route path="admin/workout-history" element={<WorkoutHistory />} />
          <Route path="admin/schedules" element={<Schedules />} />
          <Route path="admin/daily-targets" element={<DailyTargets />} />
          <Route path="admin/cardio" element={<Cardio />} />
          <Route path="admin/progress-charts" element={<ProgressCharts />} />
          <Route path="admin/reminders" element={<Reminders />} />
          <Route path="admin/leaderboard" element={<Leaderboard />} />

          {/* Client Specific Pages */}
          <Route path="client" element={<ClientDashboard />} />
          <Route path="client/weight" element={<Weight />} />
          <Route path="client/body" element={<Body />} />
          <Route path="client/strength" element={<Strength />} />
          <Route path="client/workout-history" element={<WorkoutHistory />} />
          <Route path="client/schedules" element={<Schedules />} />
          <Route path="client/daily-targets" element={<DailyTargets />} />
          <Route path="client/cardio" element={<Cardio />} />
          <Route path="client/progress-charts" element={<ProgressCharts />} />
          <Route path="client/reminders" element={<Reminders />} />
          <Route path="client/leaderboard" element={<Leaderboard />} />

          {/* Common Profile Page */}
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Profile />} />
        </Route>

        {/* Catch-all Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
