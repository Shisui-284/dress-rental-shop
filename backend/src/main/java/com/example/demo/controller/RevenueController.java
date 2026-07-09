package com.example.demo.controller;

import com.example.demo.repository.RentalScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/revenue")
@CrossOrigin(origins = "*")
public class RevenueController {

    @Autowired
    private RentalScheduleRepository rentalRepository;

    @GetMapping("/monthly")
    public Map<String, Object> getMonthlyRevenue(@RequestParam(required = false) Integer year, 
                                                 @RequestParam(required = false) Integer month) {
        if (year == null) year = LocalDate.now().getYear();
        if (month == null) month = LocalDate.now().getMonthValue();

        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        java.math.BigDecimal total = rentalRepository.sumRevenueByDateRange(startDate, endDate);
        
        Map<String, Object> response = new HashMap<>();
        response.put("year", year);
        response.put("month", month);
        response.put("totalRevenue", total);
        return response;
    }
}
