package com.luiz.autocare.autocare_scheduler.service;

import com.luiz.autocare.autocare_scheduler.dto.ServicePriceDTO;
import com.luiz.autocare.autocare_scheduler.dto.ServiceTypeResponseDTO;
import com.luiz.autocare.autocare_scheduler.exception.ResourceNotFoundException;
import com.luiz.autocare.autocare_scheduler.model.ServicePrice;
import com.luiz.autocare.autocare_scheduler.model.ServiceType;
import com.luiz.autocare.autocare_scheduler.model.VehicleSize;
import com.luiz.autocare.autocare_scheduler.repository.ServicePriceRepository;
import com.luiz.autocare.autocare_scheduler.repository.ServiceTypeRepository;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
public class ServiceTypeService {

    private final ServiceTypeRepository repository;
    private final ServicePriceRepository servicePriceRepository;

    public ServiceTypeService(
            ServiceTypeRepository repository,
            ServicePriceRepository servicePriceRepository) {
        this.repository = repository;
        this.servicePriceRepository = servicePriceRepository;
    }

    public Page<ServiceTypeResponseDTO> findAll(Pageable pageable) {
        return repository.findAll(pageable).map(this::toResponse);
    }

    public ServiceTypeResponseDTO findById(Long id) {
        return toResponse(findEntityById(id));
    }

    public ServicePrice updatePrice(Long serviceTypeId, VehicleSize vehicleSize, ServicePriceDTO dto) {
        findEntityById(serviceTypeId);
        ServicePrice servicePrice = servicePriceRepository
                .findByServiceTypeIdAndVehicleSize(serviceTypeId, vehicleSize)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No price configured for this service and vehicle size"));
        servicePrice.setPrice(dto.getPrice());
        return servicePriceRepository.save(servicePrice);
    }

    private ServiceType findEntityById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceType not found"));
    }

    private ServiceTypeResponseDTO toResponse(ServiceType serviceType) {
        return new ServiceTypeResponseDTO(
                serviceType,
                servicePriceRepository.findByServiceTypeIdOrderByVehicleSize(serviceType.getId()));
    }
}
