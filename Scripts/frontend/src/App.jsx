import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import './App.css';

// Context
import { AuthProvider } from './contexts/AuthContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import NetworkStatus from './components/NetworkStatus';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import PropertyList from './pages/PropertyList';
import PropertyDetail from './pages/PropertyDetail';
import AddProperty from './pages/AddProperty';
import MyBookings from './pages/MyBookings';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import MyProperties from './pages/MyProperties';
import AdminUsers from './pages/AdminUsers';
import AdminProperties from './pages/AdminProperties';
import AdminBookings from './pages/AdminBookings';
import AdminOwnerApprovals from './pages/AdminOwnerApprovals';
import OwnerBookings from './pages/OwnerBookings';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <NetworkStatus />
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/properties" element={<PropertyList />} />
              <Route path="/properties/:id" element={<PropertyDetail />} />
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/add-property" element={
                <ProtectedRoute requireOwner>
                  <AddProperty />
                </ProtectedRoute>
              } />
              <Route path="/my-bookings" element={
                <ProtectedRoute>
                  <MyBookings />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute requireAdmin>
                  <AdminUsers />
                </ProtectedRoute>
              } />
              <Route path="/admin/properties" element={
                <ProtectedRoute requireAdmin>
                  <AdminProperties />
                </ProtectedRoute>
              } />
              <Route path="/admin/bookings" element={
                <ProtectedRoute requireAdmin>
                  <AdminBookings />
                </ProtectedRoute>
              } />
              <Route path="/admin/owner-approvals" element={
                <ProtectedRoute requireAdmin>
                  <AdminOwnerApprovals />
                </ProtectedRoute>
              } />
              <Route path="/my-properties" element={
                <ProtectedRoute requireOwner>
                  <MyProperties />
                </ProtectedRoute>
              } />
              <Route path="/owner-bookings" element={
                <ProtectedRoute requireOwner>
                  <OwnerBookings />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          <Footer />
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
