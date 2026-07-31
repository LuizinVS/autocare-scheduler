package com.luiz.autocare.autocare_scheduler.service;

import com.luiz.autocare.autocare_scheduler.dto.AppointmentDTO;
import com.luiz.autocare.autocare_scheduler.model.*;
import com.luiz.autocare.autocare_scheduler.repository.*;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AppointmentServiceTest {

    private final AppointmentRepository appointmentRepository = mock(AppointmentRepository.class);
    private final ClientRepository clientRepository = mock(ClientRepository.class);
    private final VehicleRepository vehicleRepository = mock(VehicleRepository.class);
    private final ServiceTypeRepository serviceTypeRepository = mock(ServiceTypeRepository.class);
    private final ServicePriceRepository servicePriceRepository = mock(ServicePriceRepository.class);
    private final AppointmentService service = new AppointmentService(
            appointmentRepository,
            clientRepository,
            vehicleRepository,
            serviceTypeRepository,
            servicePriceRepository);

    @Test
    void createAppointmentSnapshotsPriceForVehicleSize() {
        Client client = new Client();
        Vehicle vehicle = new Vehicle();
        vehicle.setSize(VehicleSize.SUV);
        ServiceType serviceType = new ServiceType();
        serviceType.setId(10L);
        ServicePrice servicePrice = new ServicePrice();
        servicePrice.setPrice(65.0);

        AppointmentDTO dto = new AppointmentDTO();
        dto.setClientId(1L);
        dto.setVehicleId(2L);
        dto.setServiceTypeId(10L);
        dto.setScheduledDateTime(LocalDateTime.of(2026, 8, 1, 10, 0));

        when(clientRepository.findById(1L)).thenReturn(Optional.of(client));
        when(vehicleRepository.findById(2L)).thenReturn(Optional.of(vehicle));
        when(serviceTypeRepository.findById(10L)).thenReturn(Optional.of(serviceType));
        when(servicePriceRepository.findByServiceTypeIdAndVehicleSize(10L, VehicleSize.SUV))
                .thenReturn(Optional.of(servicePrice));
        when(appointmentRepository.findByScheduledDateTimeBetweenAndStatusNot(any(), any(), any()))
                .thenReturn(new ArrayList<>());
        when(appointmentRepository.save(any(Appointment.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Appointment saved = service.createAppointment(dto);

        assertEquals(65.0, saved.getPriceAtBooking());
        verify(servicePriceRepository)
                .findByServiceTypeIdAndVehicleSize(10L, VehicleSize.SUV);
    }
}
