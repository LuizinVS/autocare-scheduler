package com.luiz.autocare.autocare_scheduler.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VehicleDTO {

    @NotBlank(message = "Model is required")
    private String model;

    @NotBlank(message = "Brand is required")
    private String brand;

    @NotBlank(message = "License plate is required")
    private String licensePlate;

    @NotNull(message = "Client ID is required")
    private Long clientId;
}