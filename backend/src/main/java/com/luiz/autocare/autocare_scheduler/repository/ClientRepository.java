package com.luiz.autocare.autocare_scheduler.repository;

import com.luiz.autocare.autocare_scheduler.model.Client;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClientRepository extends JpaRepository<Client, Long> {
}
