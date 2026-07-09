import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LoginPage.css'; // Chúng ta sẽ tạo file CSS này ở bước sau

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Hook của React Router dùng để chuyển trang sau khi đăng nhập thành công
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            // Gọi API mới tạo để lấy thông tin user
            const response = await axios.get('http://localhost:8080/api/auth/me', {
                auth: {
                    username: username,
                    password: password
                }
            });

            if (response.status === 200) {
                const user = response.data; // Dữ liệu user trả về từ database
                const token = btoa(`${username}:${password}`);

                // Lưu thông hành và các thông tin cần thiết vào bộ nhớ trình duyệt
                localStorage.setItem('authToken', token);
                localStorage.setItem('userRole', user.role);       // Lưu quyền (ADMIN hoặc STAFF)
                localStorage.setItem('fullName', user.fullName);   // Lưu tên thật để hiển thị lời chào

                navigate('/');
            }
        } catch (err) {
            setError('Tài khoản hoặc mật khẩu không chính xác!');
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>Đăng Nhập Hệ Thống</h2>
                <p className="subtitle">Quản lý Cửa Hàng Thuê Váy</p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Tài khoản</label>
                        <input
                            type="text"
                            placeholder="Nhập username (vd: admin)"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Mật khẩu</label>
                        <input
                            type="password"
                            placeholder="Nhập mật khẩu"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="login-btn">Đăng Nhập</button>
                </form>
            </div>
        </div>
    );
}