package com.luiz.autocare.autocare_scheduler.service;

import com.luiz.autocare.autocare_scheduler.dto.VehicleDTO;
import com.luiz.autocare.autocare_scheduler.exception.ResourceNotFoundException;
import com.luiz.autocare.autocare_scheduler.model.Client;
import com.luiz.autocare.autocare_scheduler.model.Vehicle;
import com.luiz.autocare.autocare_scheduler.repository.ClientRepository;
import com.luiz.autocare.autocare_scheduler.repository.VehicleRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final ClientRepository clientRepository;

    public VehicleService(VehicleRepository vehicleRepository, ClientRepository clientRepository) {
        this.vehicleRepository = vehicleRepository;
        this.clientRepository = clientRepository;
    }

    public List<Vehicle> findAll() {
        return vehicleRepository.findAll();
    }

    public Vehicle findById(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));
    }

    public Vehicle createVehicle(VehicleDTO dto) {
        Client client = clientRepository.findById(dto.getClientId())
                .orElseThrow(() -> new ResourceNotFoundException("Client not found for this vehicle"));

        Vehicle vehicle = new Vehicle();
        vehicle.setModel(dto.getModel());
        vehicle.setBrand(dto.getBrand());
        vehicle.setLicensePlate(dto.getLicensePlate());
        vehicle.setClient(client);

        return vehicleRepository.save(vehicle);
    }

    public List<Vehicle> findByClientId(Long clientId) {
        clientRepository.findById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found"));
        return vehicleRepository.findByClientId(clientId);
    }
}