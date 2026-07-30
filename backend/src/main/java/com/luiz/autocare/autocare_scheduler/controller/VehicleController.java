package com.luiz.autocare.autocare_scheduler.controller;

import com.luiz.autocare.autocare_scheduler.dto.VehicleDTO;
import com.luiz.autocare.autocare_scheduler.model.Vehicle;
import com.luiz.autocare.autocare_scheduler.service.VehicleService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/vehicles")
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @GetMapping
    public ResponseEntity<Page<Vehicle>> findAll(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(vehicleService.findAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vehicle> findById(@PathVariable Long id) {
        return ResponseEntity.ok(vehicleService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Vehicle> createVehicle(@Valid @RequestBody VehicleDTO dto) {
        Vehicle saved = vehicleService.createVehicle(dto);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }
}
