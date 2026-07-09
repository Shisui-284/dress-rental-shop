package com.example.demo.repository;

import com.example.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    // Hàm này giúp Spring Boot tự động biết cách tìm user theo tên đăng nhập
    Optional<User> findByUsername(String username);
}