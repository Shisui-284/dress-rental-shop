import { useState, useEffect } from 'react';
import './UsersPage.css';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [showForm, setShowForm] = useState(false);
    const [newUser, setNewUser] = useState({
        username: '',
        password: '',
        fullName: ''
    });

    const getAuthHeaders = () => ({
        'Authorization': 'Basic ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json'
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('http://localhost:8080/api/users', {
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error('Failed to fetch users');
            const data = await res.json();
            setUsers(data);
        } catch (error) {
            console.error('Lỗi khi tải danh sách nhân viên:', error);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:8080/api/users', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(newUser)
            });
            
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Lỗi khi tạo nhân viên');
            }
            
            alert('Tạo nhân viên thành công!');
            setShowForm(false);
            setNewUser({ username: '', password: '', fullName: '' });
            fetchUsers();
        } catch (error) {
            console.error(error);
            alert('Tạo thất bại: ' + error.message);
        }
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        const action = currentStatus ? 'Khóa' : 'Mở khóa';
        if (!window.confirm(`Bạn có chắc muốn ${action} tài khoản này?`)) return;

        try {
            const res = await fetch(`http://localhost:8080/api/users/${userId}/toggle-status`, {
                method: 'PUT',
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error('Không thể thay đổi trạng thái');
            fetchUsers();
        } catch (error) {
            console.error(error);
            alert('Lỗi: ' + error.message);
        }
    };

    const handleChangePassword = async (userId, username) => {
        const newPassword = window.prompt(`Nhập mật khẩu mới cho tài khoản "${username}":`);
        if (!newPassword || newPassword.trim() === '') return; // Bấm hủy hoặc để trống

        if (newPassword.length < 5) {
            alert('Mật khẩu quá ngắn, vui lòng chọn mật khẩu từ 5 ký tự trở lên.');
            return;
        }

        try {
            const res = await fetch(`http://localhost:8080/api/users/${userId}/change-password?newPassword=${encodeURIComponent(newPassword)}`, {
                method: 'PUT',
                headers: getAuthHeaders()
            });
            
            if (!res.ok) throw new Error('Không thể đổi mật khẩu');
            
            alert(`Đã đổi mật khẩu cho tài khoản "${username}" thành công!`);
        } catch (error) {
            console.error(error);
            alert('Lỗi đổi mật khẩu: ' + error.message);
        }
    };

    const totalPages = Math.ceil(users.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentUsers = users.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="users-page">
            <div className="header-actions">
                <h2>Quản lý Nhân Viên (Staff)</h2>
                <button className="add-btn" onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Đóng form' : '+ Thêm Nhân Viên'}
                </button>
            </div>

            {showForm && (
                <form className="user-form" onSubmit={handleCreateUser}>
                    <div className="form-group">
                        <label>Tài khoản đăng nhập:</label>
                        <input type="text" required value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} placeholder="VD: staff01" />
                    </div>
                    <div className="form-group">
                        <label>Mật khẩu:</label>
                        <input type="password" required value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} placeholder="Nhập mật khẩu" />
                    </div>
                    <div className="form-group">
                        <label>Tên hiển thị:</label>
                        <input type="text" required value={newUser.fullName} onChange={e => setNewUser({...newUser, fullName: e.target.value})} placeholder="Họ và tên nhân viên" />
                    </div>
                    <button type="submit" className="submit-btn" style={{ alignSelf: 'flex-end', marginBottom: '3px' }}>Tạo Tài Khoản</button>
                </form>
            )}

            <div className="users-list">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tài khoản</th>
                            <th>Tên nhân viên</th>
                            <th>Quyền</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentUsers.map(u => (
                            <tr key={u.id}>
                                <td>#{u.id}</td>
                                <td>{u.username}</td>
                                <td>{u.fullName}</td>
                                <td>
                                    <span className={`role-badge ${u.role}`}>{u.role}</span>
                                </td>
                                <td>
                                    <span className={`status-badge ${u.isActive ? 'active' : 'locked'}`}>
                                        {u.isActive ? 'Hoạt động' : 'Đã Khóa'}
                                    </span>
                                </td>
                                <td>
                                    {u.role !== 'ADMIN' && (
                                        <button 
                                            className={`toggle-btn ${u.isActive ? 'lock' : 'unlock'}`}
                                            onClick={() => handleToggleStatus(u.id, u.isActive)}
                                        >
                                            {u.isActive ? 'Khóa Tài Khoản' : 'Mở Khóa'}
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => handleChangePassword(u.id, u.username)}
                                        style={{ marginLeft: '8px', padding: '6px 12px', backgroundColor: '#2196f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                        Đổi Mật Khẩu
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '15px', gap: '10px' }}>
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(c => c - 1)} style={{ padding: '5px 15px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}>Trước</button>
                        <span style={{ padding: '5px 10px', fontWeight: 'bold' }}>Trang {currentPage} / {totalPages}</span>
                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(c => c + 1)} style={{ padding: '5px 15px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}>Sau</button>
                    </div>
                )}
            </div>
        </div>
    );
}