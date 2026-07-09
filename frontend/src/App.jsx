import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ProductsPage from './pages/ProductsPage';
import RentalsPage from './pages/RentalsPage';
import RevenuePage from './pages/RevenuePage';
import AdminLayout from './components/AdminLayout';
import UsersPage from './pages/UsersPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route path="/" element={<Navigate to="/products" />} />
        
        {/* Cả Admin và Staff đều vào được */}
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/rentals" element={<RentalsPage />} />
        
        {/* Chỉ Admin mới vào được */}
        <Route path="/revenue" element={
          <ProtectedRoute requiredRole="ADMIN">
            <RevenuePage />
          </ProtectedRoute>
        } />
        <Route path="/users" element={
          <ProtectedRoute requiredRole="ADMIN">
            <UsersPage />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  );
}

export default App;