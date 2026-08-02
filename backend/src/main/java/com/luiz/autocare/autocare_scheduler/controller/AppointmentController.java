package com.luiz.autocare.autocare_scheduler.controller;

import com.luiz.autocare.autocare_scheduler.dto.AppointmentDTO;
import com.luiz.autocare.autocare_scheduler.dto.AppointmentStatusUpdateDTO;
import com.luiz.autocare.autocare_scheduler.model.Appointment;
import com.luiz.autocare.autocare_scheduler.model.AppointmentStatus;
import com.luiz.autocare.autocare_scheduler.service.AppointmentService;
import com.luiz.autocare.autocare_scheduler.service.AuthorizationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import java.util.List;

@RestController
@RequestMapping("/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final AuthorizationService authorizationService;

    public AppointmentController(AppointmentService appointmentService, AuthorizationService authorizationService) {
        this.appointmentService = appointmentService;
        this.authorizationService = authorizationService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Appointment>> findAll(
            @RequestParam(required = false) AppointmentStatus status,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate date,
            @RequestParam(required = false) Long clientId,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(appointmentService.findAll(status, date, clientId, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @authorizationService.ownsAppointment(#id)")
    public ResponseEntity<Appointment> findById(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CLIENT')")
    public ResponseEntity<Appointment> createAppointment(@Valid @RequestBody AppointmentDTO dto) {
        dto.setClientId(authorizationService.enforceClientId(dto.getClientId()));
        authorizationService.enforceVehicleOwnership(dto.getVehicleId());
        Appointment saved = appointmentService.createAppointment(dto);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @authorizationService.ownsAppointment(#id)")
    public ResponseEntity<Appointment> updateAppointment(@PathVariable Long id, @Valid @RequestBody AppointmentDTO dto) {
        dto.setClientId(authorizationService.enforceClientId(dto.getClientId()));
        authorizationService.enforceVehicleOwnership(dto.getVehicleId());
        Appointment updated = appointmentService.updateAppointment(id, dto);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Appointment> updateStatus(@PathVariable Long id, @Valid @RequestBody AppointmentStatusUpdateDTO dto) {
        Appointment updated = appointmentService.updateStatus(id, dto.getStatus());
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/availability")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLIENT')")
    public ResponseEntity<List<String>> getAvailability(@RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate date) {
        List<String> available = appointmentService.getAvailability(date);
        return ResponseEntity.ok(available);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAppointment(@PathVariable Long id) {
        appointmentService.deleteAppointment(id);
        return ResponseEntity.noContent().build();
    }
}
