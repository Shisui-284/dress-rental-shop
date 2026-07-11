package com.example.demo.service;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // 1. Lấy danh sách tất cả tài khoản
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // 2. Tạo tài khoản Staff mới
    public User createStaff(User user) {
        // Kiểm tra xem username đã tồn tại chưa
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại!");
        }

        // Mã hóa mật khẩu trước khi lưu
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        // Ép cứng quyền là STAFF và cho phép hoạt động
        user.setRole("STAFF");
        user.setIsActive(true);

        return userRepository.save(user);
    }

    // 3. Khóa / Mở khóa tài khoản nhân viên (Nghỉ việc)
    public User toggleUserStatus(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));

        // Đảo ngược trạng thái hiện tại (Đang true thành false, false thành true)
        user.setIsActive(!user.getIsActive());
        return userRepository.save(user);
    }

    // 4. Đổi mật khẩu
    public User changePassword(Integer id, String newPassword) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));
        user.setPassword(passwordEncoder.encode(newPassword));
        return userRepository.save(user);
    }
}