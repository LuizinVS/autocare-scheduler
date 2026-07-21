package com.luiz.autocare.autocare_scheduler.service;

import com.luiz.autocare.autocare_scheduler.dto.AppointmentDTO;
import com.luiz.autocare.autocare_scheduler.exception.AppointmentConflictException;
import com.luiz.autocare.autocare_scheduler.exception.ResourceNotFoundException;
import com.luiz.autocare.autocare_scheduler.model.Appointment;
import com.luiz.autocare.autocare_scheduler.model.AppointmentStatus;
import com.luiz.autocare.autocare_scheduler.model.Client;
import com.luiz.autocare.autocare_scheduler.model.ServiceType;
import com.luiz.autocare.autocare_scheduler.model.Vehicle;
import com.luiz.autocare.autocare_scheduler.repository.AppointmentRepository;
import com.luiz.autocare.autocare_scheduler.repository.ClientRepository;
import com.luiz.autocare.autocare_scheduler.repository.ServiceTypeRepository;
import com.luiz.autocare.autocare_scheduler.repository.VehicleRepository;
import org.springframework.stereotype.Service;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class AppointmentService {

    private static final long CONFLICT_WINDOW_MINUTES = 30L;
    private static final LocalTime WORK_START = LocalTime.of(8, 0);
    private static final LocalTime WORK_END = LocalTime.of(18, 0);
    private static final int SLOT_MINUTES = 30;

    private final AppointmentRepository appointmentRepository;
    private final ClientRepository clientRepository;
    private final VehicleRepository vehicleRepository;
    private final ServiceTypeRepository serviceTypeRepository;

    public AppointmentService(
            AppointmentRepository appointmentRepository,
            ClientRepository clientRepository,
            VehicleRepository vehicleRepository,
            ServiceTypeRepository serviceTypeRepository) {
        this.appointmentRepository = appointmentRepository;
        this.clientRepository = clientRepository;
        this.vehicleRepository = vehicleRepository;
        this.serviceTypeRepository = serviceTypeRepository;
    }

    public List<Appointment> findAll() {
        return findAll(null, null, null);
    }

    public java.util.List<Appointment> findAll(AppointmentStatus status, java.time.LocalDate date, Long clientId) {
        org.springframework.data.jpa.domain.Specification<Appointment> spec = org.springframework.data.jpa.domain.Specification.where(null);

        if (status != null) {
            spec = spec.and((root, cq, cb) -> cb.equal(root.get("status"), status));
        }

        if (date != null) {
            java.time.LocalDateTime start = date.atStartOfDay();
            java.time.LocalDateTime end = date.atTime(23, 59, 59);
            spec = spec.and((root, cq, cb) -> cb.between(root.get("scheduledDateTime"), start, end));
        }

        if (clientId != null) {
            spec = spec.and((root, cq, cb) -> cb.equal(root.get("client").get("id"), clientId));
        }

        return appointmentRepository.findAll(spec);
    }

    public Appointment findById(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
    }

    public Appointment createAppointment(AppointmentDTO dto) {
        Client client = clientRepository.findById(dto.getClientId())
                .orElseThrow(() -> new ResourceNotFoundException("Client not found"));
        Vehicle vehicle = vehicleRepository.findById(dto.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));
        ServiceType serviceType = serviceTypeRepository.findById(dto.getServiceTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Service type not found"));

        LocalDateTime start = dto.getScheduledDateTime().minusMinutes(CONFLICT_WINDOW_MINUTES);
        LocalDateTime end = dto.getScheduledDateTime().plusMinutes(CONFLICT_WINDOW_MINUTES);
        List<Appointment> conflicts = appointmentRepository.findByScheduledDateTimeBetweenAndStatusNot(start, end, AppointmentStatus.CANCELLED);
        if (!conflicts.isEmpty()) {
            throw new AppointmentConflictException("Requested time conflicts with an existing appointment");
        }

        Appointment appointment = new Appointment();
        appointment.setClient(client);
        appointment.setVehicle(vehicle);
        appointment.setServiceType(serviceType);
        appointment.setScheduledDateTime(dto.getScheduledDateTime());

        return appointmentRepository.save(appointment);
    }

    public Appointment updateAppointment(Long id, AppointmentDTO dto) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        Client client = clientRepository.findById(dto.getClientId())
                .orElseThrow(() -> new ResourceNotFoundException("Client not found"));
        Vehicle vehicle = vehicleRepository.findById(dto.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));
        ServiceType serviceType = serviceTypeRepository.findById(dto.getServiceTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Service type not found"));

        LocalDateTime start = dto.getScheduledDateTime().minusMinutes(CONFLICT_WINDOW_MINUTES);
        LocalDateTime end = dto.getScheduledDateTime().plusMinutes(CONFLICT_WINDOW_MINUTES);
        List<Appointment> conflicts = appointmentRepository.findByScheduledDateTimeBetweenAndStatusNot(start, end, AppointmentStatus.CANCELLED);
        // ignore self
        conflicts.removeIf(a -> a.getId().equals(id));
        if (!conflicts.isEmpty()) {
            throw new AppointmentConflictException("Requested time conflicts with an existing appointment");
        }

        appointment.setClient(client);
        appointment.setVehicle(vehicle);
        appointment.setServiceType(serviceType);
        appointment.setScheduledDateTime(dto.getScheduledDateTime());

        return appointmentRepository.save(appointment);
    }

    public Appointment updateStatus(Long id, AppointmentStatus newStatus) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new IllegalStateException("Cannot change status of a cancelled appointment");
        }
        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new IllegalStateException("Cannot change status of a completed appointment");
        }

        appointment.setStatus(newStatus);
        return appointmentRepository.save(appointment);
    }

    public List<String> getAvailability(java.time.LocalDate date) {
        LocalDateTime dayStart = date.atStartOfDay();
        LocalDateTime dayEnd = date.atTime(23, 59, 59);
        List<Appointment> appointments = appointmentRepository.findByScheduledDateTimeBetweenAndStatusNot(dayStart, dayEnd, AppointmentStatus.CANCELLED);

        List<String> available = new ArrayList<>();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("HH:mm");

        for (LocalTime time = WORK_START; !time.isAfter(WORK_END.minusMinutes(SLOT_MINUTES)); time = time.plusMinutes(SLOT_MINUTES)) {
            LocalDateTime slotDateTime = LocalDateTime.of(date, time);
            boolean occupied = appointments.stream()
                    .anyMatch(a -> Math.abs(Duration.between(slotDateTime, a.getScheduledDateTime()).toMinutes()) <= CONFLICT_WINDOW_MINUTES);
            if (!occupied) {
                available.add(time.format(fmt));
            }
        }

        return available;

    }

    public List<com.luiz.autocare.autocare_scheduler.model.Appointment> findByClientId(Long clientId) {
        clientRepository.findById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found"));
        return appointmentRepository.findByClientId(clientId);
    }
    public void deleteAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
        appointmentRepository.delete(appointment);
    }
}
