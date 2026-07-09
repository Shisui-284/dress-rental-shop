package com.example.demo.repository;

import com.example.demo.entity.RentalSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RentalScheduleRepository extends JpaRepository<RentalSchedule, Integer> {
}