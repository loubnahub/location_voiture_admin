import React, { useState, useEffect, createContext, useContext } from 'react'; // Assuming you might add AuthContext later
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import VehicleModelPage from './pages/VehicleModelPage';
import VehicleModelDetailPage from './pages/VehicleModelDetailPage';
import VehicleTypePage from './pages/VehicleTypePage';
import FeaturePage from './pages/FeaturePage';
import ExtraPage from './pages/ExtraPage';
import InsurancePlanPage from './pages/InsurancePlanPage';
import VehiclePage from './pages/VehiclePage';
import BookingPage from './pages/BookingPage';
import OperationalHoldPage from './pages/OperationalHoldPage';
// import LoginPage from './pages/LoginPage'; // You would create this
// import DashboardPage from './pages/DashboardPage'; // Example

// --- Authentication Context (Example - you might have this already or implement it) ---
// For simplicity, using a basic isAuthenticated function for now.
// In a real app, currentUser would come from context or state management.
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null); // Replace with your actual auth logic
  const [authLoading, setAuthLoading] = useState(true);

  // Mock effect to simulate checking auth status on load
  useEffect(() => {
    // Replace this with your actual API call to fetch current user
    // For example: apiFetchCurrentUser().then(user => setCurrentUser(user.data)).catch(() => setCurrentUser(null)).finally(() => setAuthLoading(false));
    const mockAuthCheck = setTimeout(() => {
      // To test logged-in state:
      setCurrentUser({ name: "Test Admin", email: "admin@example.com", roles: ["admin"] });
      // To test logged-out state:
      // setCurrentUser(null);
      setAuthLoading(false);
    }, 500);
    return () => clearTimeout(mockAuthCheck);
  }, []);

  // Add login/logout functions here that update currentUser

  if (authLoading) {
    return <div>Loading Application...</div>; // Or a global spinner
  }

  return (
    <AuthContext.Provider value={{ currentUser, /* login, logout, */ authLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- Protected Route Component ---
const ProtectedRoute = () => {
  const { currentUser, authLoading } = useAuth();

  if (authLoading) {
    return <div>Checking authentication...</div>; // Or a spinner
  }

  return currentUser ? <AdminLayout /> : <Navigate to="/login" replace />;
};


function App() {
  return (
    <AuthProvider> {/* Wrap with AuthProvider if using AuthContext */}
      <Router>
        <Routes>
          {/* --- Login Page Route (Example) --- */}
          <Route path="/login" element={
            <AuthConsumer>{({ currentUser }) => currentUser ? <Navigate to="/admin" /> : <div>Login Page Placeholder - Build LoginPage.jsx</div>}</AuthConsumer>
          } />

          {/* --- Admin Routes (Nested under AdminLayout) --- */}
          <Route path="/admin" element={<ProtectedRoute />}> {/* Uses AdminLayout */}
          
            {/* Outlet in AdminLayout will render these nested routes */}
            <Route path="/admin/inventory/vehicles" element={<VehiclePage />} /> 
            <Route path="/admin/fleet/vehicle-models" element={<VehicleModelPage />} />
            <Route path="/admin/fleet/vehicle-models/:modelId" element={<VehicleModelDetailPage />} />
            <Route path="/admin/fleet/vehicle-types" element={<VehicleTypePage />} />
            <Route path="/admin/fleet/features" element={<FeaturePage />} />
            <Route path="/admin/fleet/extras" element={<ExtraPage />} /> 
             <Route path="/admin/fleet/insurance-plans" element={<InsurancePlanPage />} />
              <Route path="/admin/inventory/bookings" element={<BookingPage />} />
              <Route path="/admin/inventory/operational-holds" element={<OperationalHoldPage/>} /> 
            {/* <Route path="dashboard" element={<DashboardPage />} /> */}
            {/* Add more admin routes as children here */}

            {/* Default route for /admin - navigates to a specific dashboard or list */}
            <Route index element={<Navigate to="/admin/fleet/vehicle-models" replace />} />
          </Route>

          {/* --- Fallback Route --- */}
          {/* Redirect to login if not authenticated, otherwise to admin dashboard/default */}
          <Route path="*" element={
             <AuthConsumer>{({ currentUser }) => currentUser ? <Navigate to="/admin" replace /> : <Navigate to="/login" replace />}</AuthConsumer>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

// Helper component to consume AuthContext easily if not using useAuth hook everywhere
const AuthConsumer = ({ children }) => {
    const auth = useAuth();
    return children(auth);
}

export default App;