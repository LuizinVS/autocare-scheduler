package com.luiz.autocare.autocare_scheduler.config;

import com.luiz.autocare.autocare_scheduler.model.ServicePrice;
import com.luiz.autocare.autocare_scheduler.model.ServiceType;
import com.luiz.autocare.autocare_scheduler.model.VehicleSize;
import com.luiz.autocare.autocare_scheduler.repository.ServicePriceRepository;
import com.luiz.autocare.autocare_scheduler.repository.ServiceTypeRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Component
public class ServiceCatalogSeeder implements CommandLineRunner {

    private final ServiceTypeRepository serviceTypeRepository;
    private final ServicePriceRepository servicePriceRepository;

    public ServiceCatalogSeeder(
            ServiceTypeRepository serviceTypeRepository,
            ServicePriceRepository servicePriceRepository) {
        this.serviceTypeRepository = serviceTypeRepository;
        this.servicePriceRepository = servicePriceRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (serviceTypeRepository.count() != 0) {
            return;
        }

        seed("Lavagem", Map.of(
                VehicleSize.PEQUENO, 30.0,
                VehicleSize.MEDIO, 40.0,
                VehicleSize.GRANDE, 55.0,
                VehicleSize.SUV, 65.0));
        seed("Higienização", Map.of(
                VehicleSize.PEQUENO, 100.0,
                VehicleSize.MEDIO, 120.0,
                VehicleSize.GRANDE, 150.0,
                VehicleSize.SUV, 170.0));
        seed("Polimento", Map.of(
                VehicleSize.PEQUENO, 120.0,
                VehicleSize.MEDIO, 150.0,
                VehicleSize.GRANDE, 180.0,
                VehicleSize.SUV, 200.0));
        seed("Enceramento", Map.of(
                VehicleSize.PEQUENO, 45.0,
                VehicleSize.MEDIO, 60.0,
                VehicleSize.GRANDE, 75.0,
                VehicleSize.SUV, 85.0));
    }

    private void seed(String name, Map<VehicleSize, Double> prices) {
        ServiceType serviceType = new ServiceType();
        serviceType.setName(name);
        serviceType = serviceTypeRepository.save(serviceType);

        for (VehicleSize vehicleSize : VehicleSize.values()) {
            ServicePrice servicePrice = new ServicePrice();
            servicePrice.setServiceType(serviceType);
            servicePrice.setVehicleSize(vehicleSize);
            servicePrice.setPrice(prices.get(vehicleSize));
            servicePriceRepository.save(servicePrice);
        }
    }
}
