package com.luiz.autocare.autocare_scheduler.controller;

import com.luiz.autocare.autocare_scheduler.dto.ServiceTypeDTO;
import com.luiz.autocare.autocare_scheduler.model.ServiceType;
import com.luiz.autocare.autocare_scheduler.service.ServiceTypeService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;

@RestController
@RequestMapping("/service-types")
public class ServiceTypeController {

    private final ServiceTypeService service;

    public ServiceTypeController(ServiceTypeService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<Page<ServiceType>> findAll(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(service.findAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceType> findById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<ServiceType> create(@Valid @RequestBody ServiceTypeDTO dto) {
        ServiceType created = service.createServiceType(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServiceType> update(@PathVariable Long id, @Valid @RequestBody ServiceTypeDTO dto) {
        ServiceType updated = service.updateServiceType(id, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteServiceType(id);
        return ResponseEntity.noContent().build();
    }
}