package com.luiz.autocare.autocare_scheduler.repository;

import com.luiz.autocare.autocare_scheduler.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
}