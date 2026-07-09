import { Link, Outlet, useNavigate } from 'react-router-dom';
import './AdminLayout.css';

export default function AdminLayout() {
    const navigate = useNavigate();
    // Lấy thông tin role và tên từ bộ nhớ
    const role = localStorage.getItem('userRole');
    const fullName = localStorage.getItem('fullName');

    const handleLogout = () => {
        localStorage.clear(); // Xóa sạch mọi thứ khi đăng xuất
        navigate('/login');
    };

    return (
        <div className="admin-container">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h2>Dress Shop</h2>
                    <p>Xin chào, {fullName}</p>
                    <p style={{ color: '#fbbf24', fontSize: '12px' }}>Quyền: {role}</p>
                </div>

                <nav className="sidebar-nav">
                    <Link to="/products" className="nav-item">👗 Quản lý Sản Phẩm</Link>
                    <Link to="/rentals" className="nav-item">📅 Lịch Thuê Váy</Link>

                    {/* Cú pháp React: CHỈ KHI role là ADMIN thì mới render 2 tab này */}
                    {role === 'ADMIN' && (
                        <>
                            <Link to="/revenue" className="nav-item">💰 Thống kê Doanh Thu</Link>
                            <Link to="/users" className="nav-item">👥 Quản lý Nhân Viên</Link>
                        </>
                    )}
                </nav>

                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="logout-btn">Đăng xuất</button>
                </div>
            </aside>

            <main className="main-content">
                <header className="top-header">
                    <h3>Hệ thống quản lý cửa hàng</h3>
                </header>
                <div className="content-area">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}