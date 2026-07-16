package com.example.demo.controller;

import com.example.demo.entity.Product;
import com.example.demo.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*") // Dòng này cực kỳ quan trọng để ReactJS (cổng 5173) có thể gọi API mà không bị
                            // chặn lỗi CORS
public class ProductController {

    @Autowired
    private ProductService productService;

    // API Lấy danh sách: GET https://dress-rental-backend.onrender.com/api/products
    @GetMapping
    public List<Product> getAllProducts() {
        return productService.getAllActiveProducts();
    }

    // API Thêm mới: POST https://dress-rental-backend.onrender.com/api/products
    @PostMapping
    public org.springframework.http.ResponseEntity<?> createProduct(@RequestBody Product product) {
        try {
            Product saved = productService.addProduct(product);
            return org.springframework.http.ResponseEntity.ok(saved);
        } catch (Exception e) {
            return org.springframework.http.ResponseEntity.status(500).body("Lỗi Server: " + e.getMessage());
        }
    }

    // Cập nhật sản phẩm
    @PutMapping("/{id}")
    public Product updateProduct(@PathVariable Integer id, @RequestBody Product product) {
        return productService.updateProduct(id, product);
    }

    // Xóa mềm sản phẩm
    @DeleteMapping("/{id}")
    public void softDeleteProduct(@PathVariable Integer id) {
        productService.softDeleteProduct(id);
    }

    // Đổi trạng thái (Bảo trì, Giặt ủi...)
    @PatchMapping("/{id}/status")
    public Product changeStatus(@PathVariable Integer id, @RequestParam String status) {
        return productService.changeStatus(id, status);
    }
}