package com.luiz.autocare.autocare_scheduler.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ServicePriceDTO {

    @NotNull(message = "Price is required")
    private Double price;
}
