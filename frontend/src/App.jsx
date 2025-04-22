import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home, Chat, Hospitals, Pharmacies, Login, Signup, Profile, MedicalHistory, UserAppointments } from './pages';
import AdminDashboard from './pages/admin/Dashboard';
import AdminSchedules from './pages/admin/Schedules';
import AdminUsers from './pages/admin/Users';
import AdminAppointments from './pages/admin/Appointments';
import { ProtectedRoute } from './components';
import AdminRoute from './components/AdminRoute';
import { ThemeProvider } from './contexts/ThemeContext';
import AppTheme from './components/AppTheme';

function App() {
  return (
    <ThemeProvider>
      <AppTheme>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/hospitals" element={<Hospitals />} />
            <Route path="/pharmacies" element={<Pharmacies />} />
            <Route path="/appointments" element={
              <ProtectedRoute>
                <UserAppointments />
              </ProtectedRoute>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/medical-history" element={
              <ProtectedRoute>
                <MedicalHistory />
              </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
            <Route path="/admin/schedules" element={
              <AdminRoute>
                <AdminSchedules />
              </AdminRoute>
            } />
            <Route path="/admin/users" element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            } />
            <Route path="/admin/appointments" element={
              <AdminRoute>
                <AdminAppointments />
              </AdminRoute>
            } />
          </Routes>
        </Router>
      </AppTheme>
    </ThemeProvider>
  );
}

export default App;