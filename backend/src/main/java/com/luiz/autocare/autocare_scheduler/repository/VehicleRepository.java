package com.luiz.autocare.autocare_scheduler.repository;

import com.luiz.autocare.autocare_scheduler.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    List<Vehicle> findByClientId(Long clientId);
}