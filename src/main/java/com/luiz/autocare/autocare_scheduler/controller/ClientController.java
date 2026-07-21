package com.luiz.autocare.autocare_scheduler.controller;

import com.luiz.autocare.autocare_scheduler.dto.ClientDTO;
import com.luiz.autocare.autocare_scheduler.model.Client;
import com.luiz.autocare.autocare_scheduler.service.ClientService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/clients")
public class ClientController {

    private final ClientService clientService;
    private final com.luiz.autocare.autocare_scheduler.service.VehicleService vehicleService;
    private final com.luiz.autocare.autocare_scheduler.service.AppointmentService appointmentService;

    public ClientController(ClientService clientService, com.luiz.autocare.autocare_scheduler.service.VehicleService vehicleService, com.luiz.autocare.autocare_scheduler.service.AppointmentService appointmentService) {
        this.clientService = clientService;
        this.vehicleService = vehicleService;
        this.appointmentService = appointmentService;
    }

    @GetMapping
    public ResponseEntity<List<Client>> findAll() {
        return ResponseEntity.ok(clientService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Client> findById(@PathVariable Long id) {
        return ResponseEntity.ok(clientService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Client> createClient(@Valid @RequestBody ClientDTO dto) {
        Client saved = clientService.createClient(dto);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @GetMapping("/{id}/vehicles")
    public ResponseEntity<List<com.luiz.autocare.autocare_scheduler.model.Vehicle>> findVehiclesByClient(@PathVariable Long id) {
        List<com.luiz.autocare.autocare_scheduler.model.Vehicle> vehicles = vehicleService.findByClientId(id);
        return ResponseEntity.ok(vehicles);
    }

    @GetMapping("/{id}/appointments")
    public ResponseEntity<List<com.luiz.autocare.autocare_scheduler.model.Appointment>> findAppointmentsByClient(@PathVariable Long id) {
        List<com.luiz.autocare.autocare_scheduler.model.Appointment> appointments = appointmentService.findByClientId(id);
        return ResponseEntity.ok(appointments);
    }
}