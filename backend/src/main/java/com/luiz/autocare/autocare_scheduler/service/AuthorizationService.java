package com.luiz.autocare.autocare_scheduler.service;

import com.luiz.autocare.autocare_scheduler.model.Role;
import com.luiz.autocare.autocare_scheduler.repository.AppointmentRepository;
import com.luiz.autocare.autocare_scheduler.repository.VehicleRepository;
import com.luiz.autocare.autocare_scheduler.security.JwtPrincipal;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service("authorizationService")
public class AuthorizationService {
    private final VehicleRepository vehicleRepository;
    private final AppointmentRepository appointmentRepository;

    public AuthorizationService(VehicleRepository vehicleRepository, AppointmentRepository appointmentRepository) {
        this.vehicleRepository = vehicleRepository;
        this.appointmentRepository = appointmentRepository;
    }

    public boolean isOwnClient(Long clientId) {
        JwtPrincipal principal = currentPrincipal();
        return principal != null && principal.role() == Role.CLIENT && clientId.equals(principal.clientId());
    }

    public boolean ownsVehicle(Long vehicleId) {
        JwtPrincipal principal = currentPrincipal();
        return principal != null && principal.clientId() != null
                && vehicleRepository.existsByIdAndClientId(vehicleId, principal.clientId());
    }

    public boolean ownsAppointment(Long appointmentId) {
        JwtPrincipal principal = currentPrincipal();
        return principal != null && principal.clientId() != null
                && appointmentRepository.existsByIdAndClientId(appointmentId, principal.clientId());
    }

    public Long enforceClientId(Long requestedClientId) {
        JwtPrincipal principal = requirePrincipal();
        if (principal.role() == Role.ADMIN) {
            return requestedClientId;
        }
        if (principal.clientId() == null || !principal.clientId().equals(requestedClientId)) {
            throw new AccessDeniedException("Clients may only act on their own account");
        }
        return principal.clientId();
    }

    public void enforceVehicleOwnership(Long vehicleId) {
        JwtPrincipal principal = requirePrincipal();
        if (principal.role() == Role.CLIENT
                && (principal.clientId() == null || !vehicleRepository.existsByIdAndClientId(vehicleId, principal.clientId()))) {
            throw new AccessDeniedException("Clients may only use their own vehicles");
        }
    }

    private JwtPrincipal requirePrincipal() {
        JwtPrincipal principal = currentPrincipal();
        if (principal == null) {
            throw new AccessDeniedException("Authenticated user is required");
        }
        return principal;
    }

    private JwtPrincipal currentPrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.getPrincipal() instanceof JwtPrincipal principal
                ? principal : null;
    }
}
