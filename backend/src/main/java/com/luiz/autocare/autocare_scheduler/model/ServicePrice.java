package com.luiz.autocare.autocare_scheduler.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(
        name = "service_prices",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_service_price_service_type_vehicle_size",
                columnNames = {"service_type_id", "vehicle_size"}))
@Getter
@Setter
public class ServicePrice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "service_type_id", nullable = false)
    private ServiceType serviceType;

    @Enumerated(EnumType.STRING)
    @Column(name = "vehicle_size", nullable = false)
    private VehicleSize vehicleSize;

    @Column(nullable = false)
    private Double price;
}
