package com.luiz.autocare.autocare_scheduler.repository;

import com.luiz.autocare.autocare_scheduler.model.Appointment;
import com.luiz.autocare.autocare_scheduler.model.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long>, JpaSpecificationExecutor<Appointment> {
    List<Appointment> findByScheduledDateTimeBetweenAndStatusNot(LocalDateTime start, LocalDateTime end, AppointmentStatus status);
    List<Appointment> findByClientId(Long clientId);
    boolean existsByIdAndClientId(Long id, Long clientId);
}
