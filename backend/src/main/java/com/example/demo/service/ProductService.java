package com.example.demo.service;

import com.example.demo.entity.Product;
import com.example.demo.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    // Hàm lấy danh sách các váy chưa bị xóa mềm
    public List<Product> getAllActiveProducts() {
        return (List<Product>) productRepository.findByIsDeletedFalse();
    }

    // Hàm thêm váy mới vào database
    public Product addProduct(Product product) {
        return productRepository.save(product);
    }

    public Product updateProduct(Integer id, Product updatedProduct) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        if (updatedProduct.getProductName() != null) existingProduct.setProductName(updatedProduct.getProductName());
        if (updatedProduct.getSize() != null) existingProduct.setSize(updatedProduct.getSize());
        if (updatedProduct.getColor() != null) existingProduct.setColor(updatedProduct.getColor());
        if (updatedProduct.getPricePerDay() != null) existingProduct.setPricePerDay(updatedProduct.getPricePerDay());
        if (updatedProduct.getImageUrl() != null) existingProduct.setImageUrl(updatedProduct.getImageUrl());
        
        return productRepository.save(existingProduct);
    }

    public void softDeleteProduct(Integer id) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        existingProduct.setIsDeleted(true);
        productRepository.save(existingProduct);
    }

    public Product changeStatus(Integer id, String status) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        existingProduct.setStatus(status);
        return productRepository.save(existingProduct);
    }
}