package com.example.demo.controller;

import com.example.demo.entity.RentalSchedule;
import com.example.demo.service.RentalScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rentals")
@CrossOrigin(origins = "*")
public class RentalScheduleController {

    @Autowired
    private RentalScheduleService rentalService;

    @GetMapping("/check-availability")
    public boolean checkAvailability(@RequestParam Integer productId, 
                                     @RequestParam String startDate, 
                                     @RequestParam String endDate) {
        return rentalService.checkAvailability(productId, LocalDate.parse(startDate), LocalDate.parse(endDate));
    }

    @PostMapping
    public RentalSchedule createRental(@RequestBody Map<String, Object> payload) {
        Integer productId = (Integer) payload.get("productId");
        Integer userId = (Integer) payload.get("userId");
        LocalDate startDate = LocalDate.parse((String) payload.get("startDate"));
        LocalDate endDate = LocalDate.parse((String) payload.get("endDate"));
        
        // Chuyển đổi totalAmount từ JSON sang BigDecimal
        java.math.BigDecimal totalAmount;
        Object amountObj = payload.get("totalAmount");
        if (amountObj instanceof Number) {
            totalAmount = new java.math.BigDecimal(amountObj.toString());
        } else {
            totalAmount = new java.math.BigDecimal((String) amountObj);
        }
        
        return rentalService.createRental(productId, userId, startDate, endDate, totalAmount);
    }

    @PatchMapping("/{id}/complete")
    public RentalSchedule completeRental(@PathVariable Integer id) {
        return rentalService.completeRental(id);
    }

    @PatchMapping("/{id}/toggle-delivery")
    public RentalSchedule toggleDeliveryStatus(@PathVariable Integer id) {
        return rentalService.toggleDeliveryStatus(id);
    }

    @GetMapping("/active")
    public List<RentalSchedule> getActiveRentals() {
        return rentalService.getActiveRentals();
    }

    @GetMapping("/overdue")
    public List<RentalSchedule> getOverdueRentals() {
        return rentalService.getOverdueRentals();
    }

    @DeleteMapping("/{id}")
    public RentalSchedule deleteRental(@PathVariable Integer id) {
        return rentalService.deleteRental(id);
    }

    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/deleted")
    public List<RentalSchedule> getDeletedRentals() {
        return rentalService.getDeletedRentals();
    }

    @GetMapping("/completed-recent")
    public List<RentalSchedule> getRecentCompletedRentals() {
        return rentalService.getRecentCompletedRentals();
    }
}
