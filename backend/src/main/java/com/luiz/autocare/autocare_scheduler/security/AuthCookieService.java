package com.luiz.autocare.autocare_scheduler.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class AuthCookieService {
    public static final String COOKIE_NAME = "auth_token";

    private final boolean secure;
    private final Duration maxAge;

    public AuthCookieService(
            @Value("${app.jwt.cookie-secure:false}") boolean secure,
            @Value("${app.jwt.expiration-ms}") long expirationMs) {
        this.secure = secure;
        this.maxAge = Duration.ofMillis(expirationMs);
    }

    public ResponseCookie create(String token) {
        return baseCookie(token).maxAge(maxAge).build();
    }

    public ResponseCookie clear() {
        return baseCookie("").maxAge(Duration.ZERO).build();
    }

    private ResponseCookie.ResponseCookieBuilder baseCookie(String value) {
        return ResponseCookie.from(COOKIE_NAME, value)
                .httpOnly(true)
                .secure(secure)
                .sameSite("Lax")
                .path("/");
    }
}
