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
        
        return rentalService.createRental(productId, userId, startDate, endDate);
    }

    @PatchMapping("/{id}/complete")
    public RentalSchedule completeRental(@PathVariable Integer id) {
        return rentalService.completeRental(id);
    }

    @GetMapping("/active")
    public List<RentalSchedule> getActiveRentals() {
        return rentalService.getActiveRentals();
    }

    @GetMapping("/overdue")
    public List<RentalSchedule> getOverdueRentals() {
        return rentalService.getOverdueRentals();
    }
}
