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

    public RentalSchedule createRental(Integer productId, Integer userId, LocalDate startDate, LocalDate endDate) {
        if (!checkAvailability(productId, startDate, endDate)) {
            throw new RuntimeException("Product is not available for the selected dates");
        }
        
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));
            
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
            
        long days = ChronoUnit.DAYS.between(startDate, endDate) + 1; // Inclusive
        BigDecimal totalAmount = product.getPricePerDay().multiply(BigDecimal.valueOf(days));
        
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
    
    public List<RentalSchedule> getOverdueRentals() {
        return rentalScheduleRepository.findOverdueRentals(LocalDate.now());
    }
}
