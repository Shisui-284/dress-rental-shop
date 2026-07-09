package com.example.demo.repository;

import com.example.demo.entity.RentalSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface RentalScheduleRepository extends JpaRepository<RentalSchedule, Integer> {
    
    @Query("SELECT COUNT(r) FROM RentalSchedule r WHERE r.product.id = :productId " +
           "AND r.actualReturnDate IS NULL " +
           "AND r.receiveDate <= :endDate AND r.expectedReturnDate >= :startDate")
    long countOverlappingRentals(@Param("productId") Integer productId, 
                                 @Param("startDate") LocalDate startDate, 
                                 @Param("endDate") LocalDate endDate);

    @Query("SELECT r FROM RentalSchedule r WHERE r.actualReturnDate IS NULL AND r.expectedReturnDate < :today")
    List<RentalSchedule> findOverdueRentals(@Param("today") LocalDate today);

    @Query("SELECT COALESCE(SUM(r.totalAmount), 0) FROM RentalSchedule r WHERE r.actualReturnDate BETWEEN :startDate AND :endDate")
    java.math.BigDecimal sumRevenueByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    // List rentals inside a date range for grouping (Day, Week)
    @Query("SELECT r FROM RentalSchedule r WHERE r.actualReturnDate BETWEEN :startDate AND :endDate")
    List<RentalSchedule> findRentalsByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // For today's active rentals
    @Query("SELECT r FROM RentalSchedule r WHERE r.actualReturnDate IS NULL")
    List<RentalSchedule> findAllActiveRentals();
}