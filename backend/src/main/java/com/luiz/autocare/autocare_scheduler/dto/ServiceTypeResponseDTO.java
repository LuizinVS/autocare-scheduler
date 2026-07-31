package com.luiz.autocare.autocare_scheduler.dto;

import com.luiz.autocare.autocare_scheduler.model.ServicePrice;
import com.luiz.autocare.autocare_scheduler.model.ServiceType;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Getter
public class ServiceTypeResponseDTO {

    private final Long id;
    private final String name;
    private final LocalDateTime createdAt;
    private final List<ServicePriceResponseDTO> prices;

    public ServiceTypeResponseDTO(ServiceType serviceType, List<ServicePrice> prices) {
        this.id = serviceType.getId();
        this.name = serviceType.getName();
        this.createdAt = serviceType.getCreatedAt();
        this.prices = prices.stream()
                .sorted(Comparator.comparingInt(price -> price.getVehicleSize().ordinal()))
                .map(ServicePriceResponseDTO::new)
                .toList();
    }
}
