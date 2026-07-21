package com.luiz.autocare.autocare_scheduler.dto;

import com.luiz.autocare.autocare_scheduler.model.AppointmentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AppointmentStatusUpdateDTO {

    @NotNull(message = "Status is required")
    private AppointmentStatus status;
}
