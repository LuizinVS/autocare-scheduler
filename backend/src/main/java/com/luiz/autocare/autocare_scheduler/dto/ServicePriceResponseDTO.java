package com.luiz.autocare.autocare_scheduler.dto;

import com.luiz.autocare.autocare_scheduler.model.ServicePrice;
import com.luiz.autocare.autocare_scheduler.model.VehicleSize;
import lombok.Getter;

@Getter
public class ServicePriceResponseDTO {

    private final VehicleSize vehicleSize;
    private final Double price;

    public ServicePriceResponseDTO(ServicePrice servicePrice) {
        this.vehicleSize = servicePrice.getVehicleSize();
        this.price = servicePrice.getPrice();
    }
}
