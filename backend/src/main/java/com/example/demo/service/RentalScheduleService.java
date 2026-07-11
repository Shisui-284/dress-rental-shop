package com.example.demo.service;

import com.example.demo.entity.Product;
import com.example.demo.entity.RentalSchedule;
import com.example.demo.entity.User;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.RentalScheduleRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.math.BigDecimal;
import java.util.List;

@Service
public class RentalScheduleService {

    @Autowired
    private RentalScheduleRepository rentalScheduleRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private UserRepository userRepository;

    public boolean checkAvailability(Integer productId, LocalDate startDate, LocalDate endDate) {
        long count = rentalScheduleRepository.countOverlappingRentals(productId, startDate, endDate);
        return count == 0;
    }

    public RentalSchedule createRental(Integer productId, Integer userId, LocalDate startDate, LocalDate endDate, BigDecimal totalAmount) {
        if (!checkAvailability(productId, startDate, endDate)) {
            throw new RuntimeException("Product is not available for the selected dates");
        }
        
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));
            
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        RentalSchedule rental = new RentalSchedule();
        rental.setProduct(product);
        rental.setCreatedBy(user);
        rental.setReceiveDate(startDate);
        rental.setExpectedReturnDate(endDate);
        rental.setTotalAmount(totalAmount);
        
        // Update product status
        product.setStatus("RENTED");
        productRepository.save(product);
        
        return rentalScheduleRepository.save(rental);
    }
    
    public RentalSchedule completeRental(Integer rentalId) {
        RentalSchedule rental = rentalScheduleRepository.findById(rentalId)
            .orElseThrow(() -> new RuntimeException("Rental not found"));
            
        rental.setActualReturnDate(LocalDate.now());
        
        Product product = rental.getProduct();
        product.setStatus("AVAILABLE");
        productRepository.save(product);
        
        return rentalScheduleRepository.save(rental);
    }
    
    public List<RentalSchedule> getActiveRentals() {
        return rentalScheduleRepository.findAllActiveRentals();
    }
    
    public RentalSchedule toggleDeliveryStatus(Integer rentalId) {
        RentalSchedule rental = rentalScheduleRepository.findById(rentalId)
            .orElseThrow(() -> new RuntimeException("Rental not found"));
            
        if ("BOOKED".equals(rental.getDeliveryStatus())) {
            rental.setDeliveryStatus("DELIVERED");
        } else {
            rental.setDeliveryStatus("BOOKED");
        }
        
        return rentalScheduleRepository.save(rental);
    }
    
    public List<RentalSchedule> getOverdueRentals() {
        return rentalScheduleRepository.findOverdueRentals(LocalDate.now());
    }

    public RentalSchedule deleteRental(Integer rentalId) {
        RentalSchedule rental = rentalScheduleRepository.findById(rentalId)
            .orElseThrow(() -> new RuntimeException("Rental not found"));
            
        rental.setIsDeleted(true);
        rental.setDeletedAt(LocalDate.now()); // Ghi nhận ngày xóa
        
        // If it was still active, revert product to AVAILABLE
        if (rental.getActualReturnDate() == null) {
            Product product = rental.getProduct();
            product.setStatus("AVAILABLE");
            productRepository.save(product);
        }
        
        // Tự động dọn dẹp các đơn bị xóa quá 7 ngày
        try {
            rentalScheduleRepository.deleteOldDeletedRentals(LocalDate.now().minusDays(7));
        } catch (Exception e) {
            System.err.println("Lỗi khi dọn dẹp đơn cũ: " + e.getMessage());
        }
        
        return rentalScheduleRepository.save(rental);
    }
    
    public List<RentalSchedule> getDeletedRentals() {
        return rentalScheduleRepository.findAllDeletedRentals();
    }

    public List<RentalSchedule> getRecentCompletedRentals() {
        return rentalScheduleRepository.findRecentCompletedRentals(LocalDate.now().minusDays(30));
    }
}
