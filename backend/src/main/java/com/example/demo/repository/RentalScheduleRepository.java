package com.example.demo.repository;

import com.example.demo.entity.RentalSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface RentalScheduleRepository extends JpaRepository<RentalSchedule, Integer> {
    
    @Query("SELECT COUNT(r) FROM RentalSchedule r WHERE r.product.id = :productId " +
           "AND r.actualReturnDate IS NULL AND (r.isDeleted = false OR r.isDeleted IS NULL) " +
           "AND r.receiveDate <= :endDate AND r.expectedReturnDate >= :startDate")
    long countOverlappingRentals(@Param("productId") Integer productId, 
                                 @Param("startDate") LocalDate startDate, 
                                 @Param("endDate") LocalDate endDate);

    @Query("SELECT r FROM RentalSchedule r WHERE r.actualReturnDate IS NULL AND r.expectedReturnDate < :today AND (r.isDeleted = false OR r.isDeleted IS NULL)")
    List<RentalSchedule> findOverdueRentals(@Param("today") LocalDate today);

    @Query("SELECT COALESCE(SUM(r.totalAmount), 0) FROM RentalSchedule r WHERE r.receiveDate BETWEEN :startDate AND :endDate AND (r.isDeleted = false OR r.isDeleted IS NULL)")
    java.math.BigDecimal sumRevenueByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    // List rentals inside a date range for grouping (Day, Week)
    @Query("SELECT r FROM RentalSchedule r WHERE r.receiveDate BETWEEN :startDate AND :endDate AND (r.isDeleted = false OR r.isDeleted IS NULL)")
    List<RentalSchedule> findRentalsByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // For today's active rentals
    @Query("SELECT r FROM RentalSchedule r WHERE r.actualReturnDate IS NULL AND (r.isDeleted = false OR r.isDeleted IS NULL)")
    List<RentalSchedule> findAllActiveRentals();

    // Lịch sử các đơn đã xóa (Dành cho Admin)
    @Query("SELECT r FROM RentalSchedule r WHERE r.isDeleted = true")
    List<RentalSchedule> findAllDeletedRentals();

    // Các đơn đã trả trong vòng 30 ngày
    @Query("SELECT r FROM RentalSchedule r WHERE r.actualReturnDate IS NOT NULL AND r.actualReturnDate >= :limitDate AND (r.isDeleted = false OR r.isDeleted IS NULL) ORDER BY r.actualReturnDate DESC")
    List<RentalSchedule> findRecentCompletedRentals(@Param("limitDate") LocalDate limitDate);

    // Xóa vĩnh viễn các đơn bị xóa quá 7 ngày để tránh phình to CSDL
    @org.springframework.data.jpa.repository.Modifying
    @jakarta.transaction.Transactional
    @Query("DELETE FROM RentalSchedule r WHERE r.isDeleted = true AND r.deletedAt < :limitDate")
    void deleteOldDeletedRentals(@Param("limitDate") LocalDate limitDate);
}