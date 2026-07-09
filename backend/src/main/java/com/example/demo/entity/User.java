package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "Users")
@Data // Annotation của Lombok giúp tự động tạo Getter/Setter ngầm định
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String role; // 'ADMIN' hoặc 'STAFF'

    @Column(name = "is_active")
    private Boolean isActive = true;
}