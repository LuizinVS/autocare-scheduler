package com.luiz.autocare.autocare_scheduler.security;

import com.luiz.autocare.autocare_scheduler.model.Role;

public record JwtPrincipal(Long userId, String email, Role role, Long clientId) {
}
