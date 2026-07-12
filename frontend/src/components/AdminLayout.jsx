import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import './AdminLayout.css';

export default function AdminLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const role = localStorage.getItem('userRole');
    const fullName = localStorage.getItem('fullName') || 'Quản trị viên';

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const navItems = [
        { to: '/products', icon: '👗', label: 'Sản Phẩm' },
        { to: '/rentals',  icon: '📅', label: 'Lịch Thuê' },
        ...(role === 'ADMIN' ? [
            { to: '/revenue', icon: '💰', label: 'Doanh Thu' },
            { to: '/users',   icon: '👥', label: 'Nhân Viên' },
        ] : []),
    ];

    // Avatar initials
    const initials = fullName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    return (
        <div className="admin-container">
            <aside className="sidebar">

                {/* LOGO / BRAND */}
                <div className="sidebar-brand">
                    <div className="brand-icon">👗</div>
                    <div className="brand-text">
                        <span className="brand-name">Dress Shop</span>
                        <span className="brand-sub">Quản lý</span>
                    </div>
                </div>

                {/* USER PROFILE CARD */}
                <div className="sidebar-profile">
                    <div className="profile-avatar">{initials}</div>
                    <div className="profile-info">
                        <span className="profile-name">{fullName}</span>
                        <span className={`profile-role ${role === 'ADMIN' ? 'role-admin' : 'role-staff'}`}>
                            {role === 'ADMIN' ? '🛡️ Quản trị' : '👤 Nhân viên'}
                        </span>
                    </div>
                </div>

                {/* NAVIGATION */}
                <nav className="sidebar-nav">
                    <p className="nav-section-label">DANH MỤC</p>
                    {navItems.map(item => {
                        const isActive = location.pathname === item.to;
                        return (
                            <Link
                                key={item.to}
                                to={item.to}
                                className={`nav-item ${isActive ? 'active' : ''}`}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                <span className="nav-label">{item.label}</span>
                                {isActive && <span className="nav-active-dot"></span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* FOOTER */}
                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="logout-btn">
                        <span>🚪</span> Đăng xuất
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <header className="top-header">
                    <div className="top-header-left">
                        <div className="page-breadcrumb">
                            {navItems.find(n => n.to === location.pathname)?.icon}&nbsp;
                            {navItems.find(n => n.to === location.pathname)?.label || 'Bảng điều khiển'}
                        </div>
                    </div>
                    <div className="top-header-right">
                        <div className="header-avatar">{initials}</div>
                        <span className="header-name">{fullName}</span>
                    </div>
                </header>
                <div className="content-area">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}