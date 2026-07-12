import { useState, useEffect } from 'react';
import { useNotification } from '../components/NotificationContext';
import './UsersPage.css';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    const [showForm, setShowForm] = useState(false);
    const [newUser, setNewUser] = useState({ username: '', password: '', fullName: '' });
    // Change password modal state
    const [pwModal, setPwModal] = useState(null); // { userId, username }
    const [newPassword, setNewPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    // Rename modal state
    const [renameModal, setRenameModal] = useState(null); // { userId, currentName }
    const [newFullName, setNewFullName] = useState('');

    const { showAlert, showConfirmAsync } = useNotification();

    const getAuthHeaders = () => ({
        'Authorization': 'Basic ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json'
    });

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('http://localhost:8080/api/users', { headers: getAuthHeaders() });
            if (!res.ok) throw new Error('Failed');
            setUsers(await res.json());
        } catch (e) { console.error(e); }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:8080/api/users', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(newUser)
            });
            if (!res.ok) throw new Error(await res.text() || 'Error');
            showAlert('Tạo tài khoản thành công!', 'success');
            setShowForm(false);
            setNewUser({ username: '', password: '', fullName: '' });
            fetchUsers();
        } catch (e) { showAlert('Tạo thất bại: ' + e.message, 'error'); }
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        const actionText = currentStatus ? 'khóa' : 'mở khóa';
        const isConfirmed = await showConfirmAsync(`Xác nhận ${actionText}`, `Bạn có chắc chắn muốn ${actionText} tài khoản này không?`, 'Xác nhận');
        if (!isConfirmed) return;
        try {
            const res = await fetch(`http://localhost:8080/api/users/${userId}/toggle-status`, {
                method: 'PUT', headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error('Thất bại');
            fetchUsers();
            showAlert(`Đã ${actionText} tài khoản.`, 'success');
        } catch (e) { showAlert('Lỗi: ' + e.message, 'error'); }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPassword.length < 5) { showAlert('Mật khẩu phải từ 5 ký tự trở lên.', 'error'); return; }
        try {
            const res = await fetch(
                `http://localhost:8080/api/users/${pwModal.userId}/change-password?newPassword=${encodeURIComponent(newPassword)}`,
                { method: 'PUT', headers: getAuthHeaders() }
            );
            if (!res.ok) throw new Error('Thất bại');
            showAlert(`Mật khẩu của tài khoản "${pwModal.username}" đã được đổi thành công!`, 'success');
            setPwModal(null);
            setNewPassword('');
        } catch (e) { showAlert('Lỗi: ' + e.message, 'error'); }
    };

    const handleRename = async (e) => {
        e.preventDefault();
        if (!newFullName.trim()) { showAlert('Tên không được để trống.', 'error'); return; }
        try {
            const res = await fetch(
                `http://localhost:8080/api/users/${renameModal.userId}/rename?newFullName=${encodeURIComponent(newFullName.trim())}`,
                { method: 'PUT', headers: getAuthHeaders() }
            );
            if (!res.ok) throw new Error('Thất bại');
            showAlert('Tên đã được cập nhật!', 'success');
            setRenameModal(null);
            setNewFullName('');
            fetchUsers();
        } catch (e) { showAlert('Lỗi: ' + e.message, 'error'); }
    };

    // Avatar initials helper
    const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
    const AVATAR_COLORS = ['#4f46e5','#0891b2','#059669','#d97706','#dc2626','#7c3aed','#db2777'];
    const getAvatarColor = (id) => AVATAR_COLORS[id % AVATAR_COLORS.length];

    const filtered = users.filter(u =>
        u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const currentUsers = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="users-page">

            {/* HEADER */}
            <div className="up-header">
                <div>
                    <h1>Account Management</h1>
                    <p>Manage all staff and admin accounts in the system.</p>
                </div>
                <button className="up-new-btn" onClick={() => setShowForm(!showForm)}>
                    {showForm ? '✕ Close' : '+ Add Account'}
                </button>
            </div>

            {/* STATS */}
            <div className="up-stats-row">
                <div className="up-stat-card">
                    <span className="up-stat-icon">👥</span>
                    <div>
                        <div className="up-stat-value">{users.length}</div>
                        <div className="up-stat-label">Total Accounts</div>
                    </div>
                </div>
                <div className="up-stat-card">
                    <span className="up-stat-icon">✅</span>
                    <div>
                        <div className="up-stat-value">{users.filter(u => u.isActive).length}</div>
                        <div className="up-stat-label">Active</div>
                    </div>
                </div>
                <div className="up-stat-card">
                    <span className="up-stat-icon">🔒</span>
                    <div>
                        <div className="up-stat-value">{users.filter(u => !u.isActive).length}</div>
                        <div className="up-stat-label">Locked</div>
                    </div>
                </div>
                <div className="up-stat-card">
                    <span className="up-stat-icon">🛡️</span>
                    <div>
                        <div className="up-stat-value">{users.filter(u => u.role === 'ADMIN').length}</div>
                        <div className="up-stat-label">Admins</div>
                    </div>
                </div>
            </div>

            {/* CREATE FORM */}
            {showForm && (
                <div className="up-form-card">
                    <h3>Create New Account</h3>
                    <form className="up-form-grid" onSubmit={handleCreateUser}>
                        <div className="up-field">
                            <label>Username</label>
                            <input type="text" required placeholder="e.g. staff01" value={newUser.username}
                                onChange={e => setNewUser({...newUser, username: e.target.value})} />
                        </div>
                        <div className="up-field">
                            <label>Password</label>
                            <input type="password" required placeholder="Min. 5 characters" value={newUser.password}
                                onChange={e => setNewUser({...newUser, password: e.target.value})} />
                        </div>
                        <div className="up-field" style={{ gridColumn: 'span 2' }}>
                            <label>Full Name</label>
                            <input type="text" required placeholder="Staff full name" value={newUser.fullName}
                                onChange={e => setNewUser({...newUser, fullName: e.target.value})} />
                        </div>
                        <button type="submit" className="up-submit-btn">Create Account</button>
                    </form>
                </div>
            )}

            {/* TABLE CARD */}
            <div className="up-table-card">
                <div className="up-table-header">
                    <h2>All Accounts <span className="up-count-chip">{filtered.length} users</span></h2>
                    <div className="up-search-box">
                        <span>🔍</span>
                        <input
                            type="text"
                            placeholder="Search by name or username..."
                            value={searchQuery}
                            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                </div>

                <table className="up-table">
                    <thead>
                        <tr>
                            <th>Account</th>
                            <th>Username</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentUsers.map(u => (
                            <tr key={u.id}>
                                <td>
                                    <div className="up-user-cell">
                                        <div className="up-avatar" style={{ background: getAvatarColor(u.id) }}>
                                            {getInitials(u.fullName)}
                                        </div>
                                        <div>
                                            <div className="up-full-name">{u.fullName}</div>
                                            <div className="up-uid">#{u.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td><span className="up-username-chip">@{u.username}</span></td>
                                <td>
                                    <span className={`up-role-badge ${u.role === 'ADMIN' ? 'admin' : 'staff'}`}>
                                        {u.role === 'ADMIN' ? '🛡️ Admin' : '👤 Staff'}
                                    </span>
                                </td>
                                <td>
                                    <span className={`up-status-badge ${u.isActive ? 'active' : 'locked'}`}>
                                        <span className="up-status-dot"></span>
                                        {u.isActive ? 'Active' : 'Locked'}
                                    </span>
                                </td>
                                <td>
                                    <div className="up-actions">
                                        {u.role !== 'ADMIN' && (
                                            <button
                                                className={`up-act-btn ${u.isActive ? 'lock-btn' : 'unlock-btn'}`}
                                                onClick={() => handleToggleStatus(u.id, u.isActive)}
                                            >
                                                {u.isActive ? '🔒 Lock' : '🔓 Unlock'}
                                            </button>
                                        )}
                                        <button
                                            className="up-act-btn rename-btn"
                                            onClick={() => { setRenameModal({ userId: u.id, currentName: u.fullName }); setNewFullName(u.fullName); }}
                                        >
                                            ✏️ Rename
                                        </button>
                                        <button
                                            className="up-act-btn pw-btn"
                                            onClick={() => { setPwModal({ userId: u.id, username: u.username }); setNewPassword(''); setShowPw(false); }}
                                        >
                                            🔑 Password
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {currentUsers.length === 0 && (
                    <p className="up-empty">No accounts match your search.</p>
                )}

                {totalPages > 1 && (
                    <div className="up-pagination">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(c => c - 1)}>‹ Prev</button>
                        <span>{currentPage} / {totalPages}</span>
                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(c => c + 1)}>Next ›</button>
                    </div>
                )}
            </div>

            {/* CHANGE PASSWORD MODAL */}
            {pwModal && (
                <div className="up-modal-overlay" onClick={() => setPwModal(null)}>
                    <div className="up-modal" onClick={e => e.stopPropagation()}>
                        <div className="up-modal-header">
                            <h3>🔑 Reset Password</h3>
                            <button className="up-modal-close" onClick={() => setPwModal(null)}>✕</button>
                        </div>
                        <p className="up-modal-sub">Account: <strong>@{pwModal.username}</strong></p>
                        <form onSubmit={handleChangePassword}>
                            <div className="up-field">
                                <label>New Password</label>
                                <div className="up-pw-input-wrap">
                                    <input
                                        type={showPw ? 'text' : 'password'}
                                        required
                                        placeholder="Enter new password (min. 5 chars)"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                    />
                                    <button type="button" className="up-pw-toggle" onClick={() => setShowPw(!showPw)}>
                                        {showPw ? '🙈' : '👁️'}
                                    </button>
                                </div>
                            </div>
                            <div className="up-modal-actions">
                                <button type="button" className="up-modal-cancel" onClick={() => setPwModal(null)}>Cancel</button>
                                <button type="submit" className="up-modal-confirm">Confirm Reset</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* RENAME MODAL */}
            {renameModal && (
                <div className="up-modal-overlay" onClick={() => setRenameModal(null)}>
                    <div className="up-modal" onClick={e => e.stopPropagation()}>
                        <div className="up-modal-header">
                            <h3>✏️ Rename Account</h3>
                            <button className="up-modal-close" onClick={() => setRenameModal(null)}>✕</button>
                        </div>
                        <p className="up-modal-sub">Current name: <strong>{renameModal.currentName}</strong></p>
                        <form onSubmit={handleRename}>
                            <div className="up-field">
                                <label>New Full Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter new display name"
                                    value={newFullName}
                                    onChange={e => setNewFullName(e.target.value)}
                                />
                            </div>
                            <div className="up-modal-actions">
                                <button type="button" className="up-modal-cancel" onClick={() => setRenameModal(null)}>Cancel</button>
                                <button type="submit" className="up-modal-confirm">Save Name</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}