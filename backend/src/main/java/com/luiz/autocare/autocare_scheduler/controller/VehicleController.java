package com.luiz.autocare.autocare_scheduler.controller;

import com.luiz.autocare.autocare_scheduler.dto.VehicleDTO;
import com.luiz.autocare.autocare_scheduler.model.Vehicle;
import com.luiz.autocare.autocare_scheduler.service.VehicleService;
import com.luiz.autocare.autocare_scheduler.service.AuthorizationService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/vehicles")
public class VehicleController {

    private final VehicleService vehicleService;
    private final AuthorizationService authorizationService;

    public VehicleController(VehicleService vehicleService, AuthorizationService authorizationService) {
        this.vehicleService = vehicleService;
        this.authorizationService = authorizationService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Vehicle>> findAll(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(vehicleService.findAll(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @authorizationService.ownsVehicle(#id)")
    public ResponseEntity<Vehicle> findById(@PathVariable Long id) {
        return ResponseEntity.ok(vehicleService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CLIENT')")
    public ResponseEntity<Vehicle> createVehicle(@Valid @RequestBody VehicleDTO dto) {
        dto.setClientId(authorizationService.enforceClientId(dto.getClientId()));
        Vehicle saved = vehicleService.createVehicle(dto);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }
}
