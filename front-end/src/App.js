import React,{useEffect} from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate,Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Layouts
import AdminLayout from './layouts/AdminLayout';

// Pages
import LoginPage from './Clients/Compte/Login';
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
import Home from './Clients/Home/Home';
import ClientLayout from './layouts/ClientLayout';
import VehicleModelCreatePage from './pages/VehicleModelCreatePage';
import VehicleCreatePage from './pages/VehicleCreatePage'


import Vehicle from './Clients/VEHICLE/Vehicle';
import CarDetailPage from './Clients/DetailsCars/DetailsModalCar'; 
import CarProductPage from './Clients/DetailsCars/DetailsCarColor'; 
import Service from './Clients/Services/Service';
import Contact from './Clients/Contact/Contact';
import About from './Clients/About/About';
import CarDetails3d from './Clients/DetailsCars/DetailsCar3d'; 
import BookingPageClient from './Clients/DetailsCars/RentNow';
import SignUpPage from './Clients/Compte/Singup';
import NotificationsPage from './Clients/Compte/Notification';
import FAQs from './Clients/FAQs/Faqs';
import Blog from './Clients/Blog/Blog';
import PrivacyPolicyPage from './Clients/Privacy/Section/PrivacyPage';

import SignUpClient from './Clients/Compte/Singup'
import Profiel from './Clients/Profiel/Profiel';
import Testiominals from './Clients/testiominals/testiominals';
import VedioStart from './Clients/Vedio';
// In App.js


// In App.js
const ProtectedRoute = ({ requiredRole }) => {
  const { isAuthenticated, isLoading, currentUser } = useAuth();




  if (isLoading) {
    return <div>Loading Application...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!currentUser) {
    return <div>Finalizing Session...</div>;
  }

  // --- THIS IS THE MOST IMPORTANT PART ---
  // At this point, we have a user. Let's inspect them carefully.
  
  const userHasRole = currentUser.roles?.includes(requiredRole);
  

  if (!userHasRole) {
    return <Navigate to="/" replace />;
  }

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading, currentUser } = useAuth();


  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    if (!currentUser) {
      return <div>Finalizing Session...</div>;
    }
    
    const isAdmin = currentUser.roles?.includes('admin');
    if (isAdmin) {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  // If we are not loading and not authenticated, show the child (the login page).
  return children;
};

// --- Fallback Auth Redirect ---
const AuthRedirect = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return <div>Loading...</div>;
  }
  return isAuthenticated ? <Navigate to="/" replace /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      
      <AuthProvider>
        <Routes>
          <Route path="/" element={<VedioStart />} />
          <Route path="/Singup" element={<SignUpPage />} />
          {/* Public Routes */}
          <Route path="/" element={<ClientLayout />}>
            <Route path="/Home" element={<Home />} />
            <Route path="/Notification" element={<NotificationsPage />} />
            <Route path="/fleet" element={<Vehicle />} /> 
            <Route path="/fleet/details/:vehicleId" element={<CarDetailPage />} />
            <Route path="/booking/:vehicleId" element={<BookingPageClient />} />
            <Route path="/fleet/details/:vehicleId/3d" element={<CarDetails3d />} />
            <Route path="/fleet/details/:vehicleId/ar" element={<CarProductPage />} />
            <Route path="/Services" element={<Service />} />
            <Route path="/Contact" element={<Contact />} />
            <Route path="/About" element={<About />} />
            <Route path="/FAQs" element={<FAQs />} />
            <Route path="/Blog" element={<Blog />} />
            <Route path="/Testiominals" element={<Testiominals />} />
            <Route path="/Profiel/:user_id" element={<Profiel />} />
            <Route path="/PrivacyPolicy" element={<PrivacyPolicyPage/>} />
          </Route>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
<Route
            path="/SignUp"
            element={
              <PublicRoute>
                <SignUpClient />
              </PublicRoute>
            }
          />
          {/* Protected Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute  requiredRole="admin"/>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="inventory/vehicles" element={<VehiclePage />} />
            <Route path="fleet/vehicle-models" element={<VehicleModelPage />} />
            <Route path="fleet/vehicle-models/:modelId" element={<VehicleModelDetailView />} />
            <Route path="fleet/vehicle-models/:modelId/gallery" element={<VehicleDisplayGallery />} />
            <Route path="fleet/vehicle-types" element={<VehicleTypePage />} />
            <Route path="fleet/features" element={<FeaturePage />} />
            <Route path="fleet/extras" element={<ExtraPage />} />
            <Route path="fleet/vehicle-models/create" element={<VehicleModelCreatePage />} />
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
               <Route path="vehicles/create" element={<VehicleCreatePage />} />

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