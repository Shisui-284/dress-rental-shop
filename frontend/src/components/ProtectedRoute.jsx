import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, requiredRole }) {
    const role = localStorage.getItem('userRole');

    if (!role) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && role !== requiredRole) {
        // Nếu role không khớp, đẩy về trang chủ của họ
        return <Navigate to="/products" replace />;
    }

    return children;
}
