package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "Products")
@Data
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "product_code", unique = true, nullable = false)
    private String productCode;

    @Column(name = "product_name", nullable = false)
    private String productName;

    @Column(nullable = false)
    private String size;

    @Column(nullable = false)
    private String color;

    @Column(name = "price_per_day", nullable = false)
    private java.math.BigDecimal pricePerDay;

    @Column(name = "image_url")
    private String imageUrl;

    private String status = "AVAILABLE";

    @Column(name = "is_deleted")
    private Boolean isDeleted = false;
}