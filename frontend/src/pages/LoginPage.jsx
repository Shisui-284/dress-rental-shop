import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LoginPage.css'; 
import loginBg from '../assets/login_dress_bg.png';

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
            const response = await axios.get('https://dress-rental-backend.onrender.com/api/auth/me', {
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
        <div className="login-wrapper">
            <div className="login-container">
                {/* Left side: Image */}
                <div className="login-image-section">
                    <img src={loginBg} alt="Elegant Dress" className="cover-image" />
                </div>

                {/* Right side: Form */}
                <div className="login-form-section">
                    <div className="form-header">
                        <h2>Chào mừng trở lại</h2>
                        <p className="subtitle">Vui lòng nhập thông tin để đăng nhập</p>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleLogin} className="login-form">
                        <div className="form-group">
                            <label>Tên đăng nhập</label>
                            <div className="input-with-icon">
                                <span className="icon">👤</span>
                                <input
                                    type="text"
                                    placeholder="Nhập tên đăng nhập"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Mật khẩu</label>
                            <div className="input-with-icon">
                                <span className="icon">🔒</span>
                                <input
                                    type="password"
                                    placeholder="Nhập mật khẩu"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-options">
                            <label className="remember-me">
                                <input type="checkbox" /> Ghi nhớ đăng nhập
                            </label>
                            <a href="#" className="forgot-password">Quên mật khẩu?</a>
                        </div>

                        <button type="submit" className="login-btn">Đăng nhập</button>
                    </form>

                    <div className="social-login">
                        <p>Hoặc đăng nhập bằng</p>
                        <div className="social-buttons">
                            <button className="social-btn google-btn">G</button>
                            <button className="social-btn facebook-btn">f</button>
                            <button className="social-btn apple-btn"></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}