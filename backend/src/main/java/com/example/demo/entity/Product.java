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

    @org.hibernate.annotations.Nationalized
    @Column(name = "product_name", nullable = false)
    private String productName;

    @Column(nullable = false)
    private String size;

    @org.hibernate.annotations.Nationalized
    @Column(nullable = false)
    private String color;

    @Column(name = "image_url")
    private String imageUrl;

    private String status = "AVAILABLE";

    @Column(name = "is_deleted")
    private Boolean isDeleted = false;

    @Column(name = "rental_price")
    private Double rentalPrice = 0.0;

    @Column(name = "deposit_amount")
    private Double depositAmount = 0.0;
}