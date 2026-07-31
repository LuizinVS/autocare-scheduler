package com.luiz.autocare.autocare_scheduler.repository;

import com.luiz.autocare.autocare_scheduler.model.ServicePrice;
import com.luiz.autocare.autocare_scheduler.model.VehicleSize;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServicePriceRepository extends JpaRepository<ServicePrice, Long> {

    Optional<ServicePrice> findByServiceTypeIdAndVehicleSize(Long serviceTypeId, VehicleSize vehicleSize);

    List<ServicePrice> findByServiceTypeIdOrderByVehicleSize(Long serviceTypeId);
}
