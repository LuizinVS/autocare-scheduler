package com.luiz.autocare.autocare_scheduler.service;

import com.luiz.autocare.autocare_scheduler.dto.ServiceTypeDTO;
import com.luiz.autocare.autocare_scheduler.exception.ResourceNotFoundException;
import com.luiz.autocare.autocare_scheduler.model.ServiceType;
import com.luiz.autocare.autocare_scheduler.repository.ServiceTypeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ServiceTypeService {

    private final ServiceTypeRepository repository;

    public ServiceTypeService(ServiceTypeRepository repository) {
        this.repository = repository;
    }

    public List<ServiceType> findAll() {
        return repository.findAll();
    }

    public ServiceType findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceType not found"));
    }

    public ServiceType createServiceType(ServiceTypeDTO dto) {
        ServiceType serviceType = new ServiceType();
        serviceType.setName(dto.getName());
        serviceType.setPrice(dto.getPrice());
        return repository.save(serviceType);
    }

    public ServiceType updateServiceType(Long id, ServiceTypeDTO dto) {
        ServiceType serviceType = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceType not found"));
        serviceType.setName(dto.getName());
        serviceType.setPrice(dto.getPrice());
        return repository.save(serviceType);
    }

    public void deleteServiceType(Long id) {
        ServiceType serviceType = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceType not found"));
        repository.delete(serviceType);
    }
}