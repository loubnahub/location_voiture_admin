import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate,Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Layouts
import AdminLayout from './layouts/AdminLayout';

// Pages
import LoginPage from './pages/Auth/LoginPage';
import DashboardPage from './pages/DashboardPage';
import VehicleModelPage from './pages/VehicleModelPage';
import VehicleTypePage from './pages/VehicleTypePage';
import FeaturePage from './pages/FeaturePage';
import ExtraPage from './pages/ExtraPage';
import InsurancePlanPage from './pages/InsurancePlanPage';
import VehiclePage from './pages/VehiclePage';
import BookingPage from './pages/BookingPage';
import OperationalHoldPage from './pages/OperationalHoldPage';
import DamageReportPage from './pages/DamageReportPage';
import UserPage from './pages/UserPage';
import RolePage from './pages/RolePage';
import RentalAgreementPage from './pages/RentalAgreementPage';
import PromotionCampaignPage from './pages/promotions/PromotionCampaignPage';
import PromotionCodePage from './pages/promotions/PromotionCodePage';
import PaymentPage from './pages/payments/PaymentsPage';
import VehicleModelDetailView from './components/VehicleModelDetailView';
import VehicleInstanceDetailView from './components/VehicleInstanceDetailView';
import VehicleDisplayGallery from './components/VehicleDisplayGallery';


import LoginClient from './Clients/Compte/Login';
import Home from './Clients/Home/Home';
import SignUpClient from './Clients/Compte/Singup';
import CarColorPage from './Clients/DetailsCars/DetailsCarColor';
import CarDetails3d from './Clients/DetailsCars/DetailsCar3d';
import CarDetailPage from './Clients/DetailsCars/DetailsModalCar';
import OurServiceSection from './Clients/Home/Section/ServiceHome';
import ContactPage from './Clients/Contact/Section/ContactPage';
import About from './Clients/About/About';
import BookingPageClient from './Clients/DetailsCars/RentNow';
import Vehicle from './Clients/VEHICLE/Vehicle';

// --- Protected Route Component ---
const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading authentication status...</div>;
  }
  // Render AdminLayout with Outlet for nested routes!
  return isAuthenticated ? (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  ) : (
    <Navigate to="/login" replace />
  );
};

// --- Public Route Component ---
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }
  return isAuthenticated ? <Navigate to="/admin/dashboard" replace /> : children;
};

// --- Fallback Auth Redirect ---
const AuthRedirect = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return <div>Loading...</div>;
  }
  return isAuthenticated ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
          
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
            <Route path="/LoginClient" element={<LoginClient />} />  
            <Route path="/home" element={<Home />} />
            <Route path="/Signup" element={<SignUpClient />} />
            <Route path="/LoginClient" element={<LoginClient/>} />  // Example: Client login if different from admin
            <Route path="/fleet" element={<Vehicle />} /> {/* Lists available vehicles/vehicle models */}   
            <Route path="/fleet/details/:vehicleId" element={<CarDetailPage />} />
            <Route path="/booking/:vehicleId" element={<BookingPageClient />} />
            <Route path="/fleet/details/:vehicleId/3d" element={<CarDetails3d />} />
            <Route path="/fleet/details/:vehicleId/ar" element={<CarColorPage />} />
            <Route path="/Services" element={<OurServiceSection />} />
            <Route path="/Contact" element={<ContactPage />} />
            <Route path="/About" element={<About />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          {/* Protected Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="inventory/vehicles" element={<VehiclePage />} />
            <Route path="fleet/vehicle-models" element={<VehicleModelPage />} />
            <Route path="fleet/vehicle-models/:modelId" element={<VehicleModelDetailView />} />
            <Route path="fleet/vehicle-models/:modelId/gallery" element={<VehicleDisplayGallery />} />
            <Route path="fleet/vehicle-types" element={<VehicleTypePage />} />
            <Route path="fleet/features" element={<FeaturePage />} />
            <Route path="fleet/extras" element={<ExtraPage />} />
            <Route path="fleet/insurance-plans" element={<InsurancePlanPage />} />
            <Route path="/admin/inventory/bookings" element={<BookingPage />} />
            <Route path="operations/damage-reports" element={<DamageReportPage />} />
            <Route path="operations/operational-holds" element={<OperationalHoldPage />} />
            <Route path="operations/rental-agreements" element={<RentalAgreementPage />} />
            <Route path="users/customers" element={<UserPage />} />
            <Route path="users/roles" element={<RolePage />} />
            <Route path="marketing/promotion-campaigns" element={<PromotionCampaignPage />} />
            <Route path="marketing/promotion-codes" element={<PromotionCodePage />} />
            <Route path="financials/payments" element={<PaymentPage />} />
            <Route path="vehicle-instance/:instanceId" element={<VehicleInstanceDetailView />} />

            {/* Add other admin routes here */}
          </Route>
          {/* Fallback Route */}
          <Route path="*" element={<AuthRedirect />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;