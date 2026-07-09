package com.example.demo.controller;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    // API này ai đăng nhập đúng mật khẩu cũng gọi được
    @GetMapping("/me")
    public User getCurrentUser(Authentication authentication) {
        // authentication.getName() lấy ra username của người vừa nhập đúng mật khẩu
        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));
    }
}