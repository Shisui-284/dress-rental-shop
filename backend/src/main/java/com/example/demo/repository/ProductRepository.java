package com.example.demo.repository;

import com.example.demo.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Integer> {
    // Chỉ lấy ra các sản phẩm chưa bị xóa mềm
    Iterable<Product> findByIsDeletedFalse();
}