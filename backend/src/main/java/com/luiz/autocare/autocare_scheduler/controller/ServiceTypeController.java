package com.luiz.autocare.autocare_scheduler.controller;

import com.luiz.autocare.autocare_scheduler.dto.ServicePriceDTO;
import com.luiz.autocare.autocare_scheduler.dto.ServicePriceResponseDTO;
import com.luiz.autocare.autocare_scheduler.dto.ServiceTypeResponseDTO;
import com.luiz.autocare.autocare_scheduler.model.ServicePrice;
import com.luiz.autocare.autocare_scheduler.model.VehicleSize;
import com.luiz.autocare.autocare_scheduler.service.ServiceTypeService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/service-types")
public class ServiceTypeController {

    private final ServiceTypeService service;

    public ServiceTypeController(ServiceTypeService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CLIENT')")
    public ResponseEntity<Page<ServiceTypeResponseDTO>> findAll(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(service.findAll(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLIENT')")
    public ResponseEntity<ServiceTypeResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PutMapping("/{serviceTypeId}/prices/{vehicleSize}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ServicePriceResponseDTO> updatePrice(
            @PathVariable Long serviceTypeId,
            @PathVariable VehicleSize vehicleSize,
            @Valid @RequestBody ServicePriceDTO dto) {
        ServicePrice updated = service.updatePrice(serviceTypeId, vehicleSize, dto);
        return ResponseEntity.ok(new ServicePriceResponseDTO(updated));
    }
}
