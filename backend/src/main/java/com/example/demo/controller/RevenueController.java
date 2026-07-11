package com.example.demo.controller;

import com.example.demo.repository.RentalScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;
import com.example.demo.entity.RentalSchedule;
import java.math.BigDecimal;

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

    @GetMapping("/yearly")
    public java.util.List<Map<String, Object>> getYearlyRevenue(@RequestParam(required = false) Integer year) {
        if (year == null) year = LocalDate.now().getYear();
        
        java.util.List<Map<String, Object>> yearlyData = new java.util.ArrayList<>();
        
        for (int m = 1; m <= 12; m++) {
            LocalDate startDate = LocalDate.of(year, m, 1);
            LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
            java.math.BigDecimal total = rentalRepository.sumRevenueByDateRange(startDate, endDate);
            
            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", m);
            monthData.put("revenue", total);
            yearlyData.add(monthData);
        }
        
        return yearlyData;
    }

    @GetMapping("/details")
    public Map<String, Object> getRevenueDetails(@RequestParam(required = false) Integer year,
                                                 @RequestParam(required = false) Integer month) {
        if (year == null) year = LocalDate.now().getYear();
        if (month == null) month = LocalDate.now().getMonthValue();

        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        // Get all completed rentals in this month
        List<RentalSchedule> rentals = rentalRepository.findRentalsByDateRange(startDate, endDate);

        // Calculate total
        BigDecimal total = rentals.stream()
                .map(RentalSchedule::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Group by day (1 -> 31)
        Map<Integer, BigDecimal> dailyMap = new HashMap<>();
        for (int i = 1; i <= endDate.getDayOfMonth(); i++) dailyMap.put(i, BigDecimal.ZERO);
        
        // Group by week (1 -> 5)
        Map<Integer, BigDecimal> weeklyMap = new HashMap<>();
        for (int i = 1; i <= 5; i++) weeklyMap.put(i, BigDecimal.ZERO);

        for (RentalSchedule r : rentals) {
            LocalDate receiveDate = r.getReceiveDate();
            if (receiveDate != null) {
                int day = receiveDate.getDayOfMonth();
                dailyMap.put(day, dailyMap.get(day).add(r.getTotalAmount()));
                
                // Simple week calculation
                int week = ((day - 1) / 7) + 1;
                if (week > 5) week = 5;
                weeklyMap.put(week, weeklyMap.get(week).add(r.getTotalAmount()));
            }
        }

        // Format outputs
        List<Map<String, Object>> daily = new ArrayList<>();
        for (int i = 1; i <= endDate.getDayOfMonth(); i++) {
            Map<String, Object> d = new HashMap<>();
            d.put("date", i);
            d.put("revenue", dailyMap.get(i));
            daily.add(d);
        }

        List<Map<String, Object>> weekly = new ArrayList<>();
        for (int i = 1; i <= 5; i++) {
            Map<String, Object> w = new HashMap<>();
            w.put("week", i);
            w.put("revenue", weeklyMap.get(i));
            weekly.add(w);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("year", year);
        response.put("month", month);
        response.put("totalRevenue", total);
        response.put("daily", daily);
        response.put("weekly", weekly);

        return response;
    }
}
