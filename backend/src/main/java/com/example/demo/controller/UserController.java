package com.example.demo.controller;

import com.example.demo.entity.User;
import com.example.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
// BẮT BUỘC: Chỉ người có quyền ADMIN mới được gọi các API trong class này
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    @Autowired
    private UserService userService;

    // Lấy danh sách nhân viên
    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    // Tạo nhân viên mới
    @PostMapping
    public User createStaff(@RequestBody User user) {
        return userService.createStaff(user);
    }

    // Khóa hoặc mở khóa tài khoản
    @PutMapping("/{id}/toggle-status")
    public User toggleStatus(@PathVariable Integer id) {
        return userService.toggleUserStatus(id);
    }
}