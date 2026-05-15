import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Sidebar from './components/common/Sidebar';
import Topbar from './components/common/Topbar';
import CartSidebar from './components/common/CartSidebar';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyAccount from './pages/auth/VerifyAccount';
import StudentDashboard from './pages/student/Dashboard';
import MenuBrowser from './pages/student/MenuBrowser';
import MyOrders from './pages/student/MyOrders';
import Profile from './pages/student/Profile';
import OwnerDashboard from './pages/owner/Dashboard';
import OrderQueue from './pages/owner/OrderQueue';
import ManageMenu from './pages/owner/ManageMenu';
import VerifyStudents from './pages/owner/VerifyStudents';

const ProtectedLayout = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loader" style={{ minHeight: '100vh' }}><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/login" />;
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar />
        <Outlet />
      </div>
      <CartSidebar />
    </div>
  );
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loader" style={{ minHeight: '100vh' }}><div className="spinner"></div></div>;
  if (user) {
    const path = user.role === 'student' ? '/dashboard' : '/owner/dashboard';
    return <Navigate to={path} />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Toaster position="top-right" toastOptions={{ style: { background: '#1a1a2e', color: '#f5f5f5', border: '1px solid rgba(255,255,255,0.1)' } }} />
          <Routes>
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
              <Route path="/verify" element={<VerifyAccount />} />
              <Route element={<ProtectedLayout />}>
                <Route path="/dashboard" element={<StudentDashboard />} />
                <Route path="/menu" element={<MenuBrowser />} />
                <Route path="/my-orders" element={<MyOrders />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/owner/dashboard" element={<OwnerDashboard />} />
                <Route path="/owner/orders" element={<OrderQueue />} />
                <Route path="/owner/menu" element={<ManageMenu />} />
                <Route path="/owner/verify" element={<VerifyStudents />} />
              </Route>
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
