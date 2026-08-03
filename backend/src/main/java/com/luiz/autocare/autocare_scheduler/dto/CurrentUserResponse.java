package com.luiz.autocare.autocare_scheduler.dto;

import com.luiz.autocare.autocare_scheduler.model.Role;

public record CurrentUserResponse(String email, Role role, Long clientId) {
}
