package com.luiz.autocare.autocare_scheduler.controller;

import com.luiz.autocare.autocare_scheduler.dto.AppointmentDTO;
import com.luiz.autocare.autocare_scheduler.dto.AppointmentStatusUpdateDTO;
import com.luiz.autocare.autocare_scheduler.model.Appointment;
import com.luiz.autocare.autocare_scheduler.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @GetMapping
    public ResponseEntity<List<Appointment>> findAll() {
        return ResponseEntity.ok(appointmentService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Appointment> findById(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Appointment> createAppointment(@Valid @RequestBody AppointmentDTO dto) {
        Appointment saved = appointmentService.createAppointment(dto);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Appointment> updateAppointment(@PathVariable Long id, @Valid @RequestBody AppointmentDTO dto) {
        Appointment updated = appointmentService.updateAppointment(id, dto);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Appointment> updateStatus(@PathVariable Long id, @Valid @RequestBody AppointmentStatusUpdateDTO dto) {
        Appointment updated = appointmentService.updateStatus(id, dto.getStatus());
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/availability")
    public ResponseEntity<List<String>> getAvailability(@RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate date) {
        List<String> available = appointmentService.getAvailability(date);
        return ResponseEntity.ok(available);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAppointment(@PathVariable Long id) {
        appointmentService.deleteAppointment(id);
        return ResponseEntity.noContent().build();
    }
}
