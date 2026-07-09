package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "RentalSchedules")
@Data
public class RentalSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Liên kết khóa ngoại tới bảng Products
    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "receive_date", nullable = false)
    private LocalDate receiveDate;

    @Column(name = "expected_return_date", nullable = false)
    private LocalDate expectedReturnDate;

    @Column(name = "actual_return_date")
    private LocalDate actualReturnDate;

    @Column(name = "total_amount", nullable = false)
    private BigDecimal totalAmount;

    // Liên kết khóa ngoại tới bảng Users
    @ManyToOne
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;
}