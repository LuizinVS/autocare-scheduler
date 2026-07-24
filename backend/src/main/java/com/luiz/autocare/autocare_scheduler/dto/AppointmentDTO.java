package com.luiz.autocare.autocare_scheduler.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class AppointmentDTO {

    @NotNull(message = "Client ID is required")
    private Long clientId;

    @NotNull(message = "Vehicle ID is required")
    private Long vehicleId;

    @NotNull(message = "Service Type ID is required")
    private Long serviceTypeId;

    @NotNull(message = "Scheduled date and time is required")
    private LocalDateTime scheduledDateTime;
}