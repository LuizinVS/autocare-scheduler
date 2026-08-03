package com.luiz.autocare.autocare_scheduler.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.luiz.autocare.autocare_scheduler.model.Client;
import com.luiz.autocare.autocare_scheduler.model.Role;
import com.luiz.autocare.autocare_scheduler.repository.ClientRepository;
import com.luiz.autocare.autocare_scheduler.repository.UserRepository;
import com.luiz.autocare.autocare_scheduler.security.JwtService;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.http.HttpHeaders;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthSecurityIntegrationTest {
    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired UserRepository userRepository;
    @Autowired ClientRepository clientRepository;
    @Autowired PasswordEncoder passwordEncoder;
    @Autowired JwtService jwtService;

    @Test
    void registerCreatesLinkedClientUserAndSetsValidJwtCookie() throws Exception {
        String token = registerAndGetToken("register@example.com");

        var user = userRepository.findByEmailIgnoreCase("register@example.com").orElseThrow();
        Client client = clientRepository.findByUserId(user.getId()).orElseThrow();
        assertEquals(Role.CLIENT, user.getRole());
        assertTrue(passwordEncoder.matches("password123", user.getPassword()));
        assertEquals(user.getId(), jwtService.parseToken(token).userId());
        assertEquals(client.getId(), jwtService.parseToken(token).clientId());
    }

    @Test
    void loginReturnsJwtForCorrectCredentialsAnd401ForIncorrectCredentials() throws Exception {
        registerAndGetToken("login@example.com");

        var loginResult = mockMvc.perform(post("/api/auth/login").contextPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("email", "login@example.com", "password", "password123"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(header().string(HttpHeaders.SET_COOKIE, org.hamcrest.Matchers.allOf(
                        org.hamcrest.Matchers.containsString("auth_token="),
                        org.hamcrest.Matchers.containsString("Path=/"),
                        org.hamcrest.Matchers.containsString("Max-Age=86400"),
                        org.hamcrest.Matchers.containsString("HttpOnly"),
                        org.hamcrest.Matchers.containsString("SameSite=Lax"))))
                .andReturn();
        assertFalse(loginResult.getResponse().getHeader(HttpHeaders.SET_COOKIE).contains("Secure"));

        mockMvc.perform(post("/api/auth/login").contextPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("email", "login@example.com", "password", "wrong-password"))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    @Test
    void protectedEndpointReturns401WithoutToken() throws Exception {
        mockMvc.perform(get("/api/clients").contextPath("/api"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void clientCannotListAllClientsButCanReadOwnRecord() throws Exception {
        String token = registerAndGetToken("owner@example.com");
        var user = userRepository.findByEmailIgnoreCase("owner@example.com").orElseThrow();
        Long clientId = clientRepository.findByUserId(user.getId()).orElseThrow().getId();

        mockMvc.perform(get("/api/clients").contextPath("/api").header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/clients/{id}", clientId).contextPath("/api").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(clientId))
                .andExpect(jsonPath("$.email").value("owner@example.com"));
    }

    @Test
    void cookieAloneAuthenticatesProtectedRequestAndMeReturnsPrincipal() throws Exception {
        String email = "cookie-owner@example.com";
        String token = registerAndGetToken(email);
        var user = userRepository.findByEmailIgnoreCase(email).orElseThrow();
        Long clientId = clientRepository.findByUserId(user.getId()).orElseThrow().getId();
        Cookie authCookie = new Cookie("auth_token", token);

        mockMvc.perform(get("/api/clients/{id}", clientId).contextPath("/api").cookie(authCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(clientId));

        mockMvc.perform(get("/api/auth/me").contextPath("/api").cookie(authCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.role").value("CLIENT"))
                .andExpect(jsonPath("$.clientId").value(clientId));
    }

    @Test
    void logoutClearsAuthenticationCookie() throws Exception {
        mockMvc.perform(post("/api/auth/logout").contextPath("/api"))
                .andExpect(status().isNoContent())
                .andExpect(header().string(HttpHeaders.SET_COOKIE, org.hamcrest.Matchers.allOf(
                        org.hamcrest.Matchers.containsString("auth_token="),
                        org.hamcrest.Matchers.containsString("Path=/"),
                        org.hamcrest.Matchers.containsString("Max-Age=0"),
                        org.hamcrest.Matchers.containsString("HttpOnly"),
                        org.hamcrest.Matchers.containsString("SameSite=Lax"))));
    }

    @Test
    void corsAllowsCredentialsForConfiguredOrigin() throws Exception {
        mockMvc.perform(options("/api/auth/me").contextPath("/api")
                        .header(HttpHeaders.ORIGIN, "http://localhost:4200")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:4200"))
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true"));
    }

    private String registerAndGetToken(String email) throws Exception {
        String response = mockMvc.perform(post("/api/auth/register").contextPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of(
                                "name", "Test Client",
                                "phone", "11999999999",
                                "email", email,
                                "password", "password123"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(header().string(HttpHeaders.SET_COOKIE, org.hamcrest.Matchers.containsString("auth_token=")))
                .andReturn().getResponse().getContentAsString();
        JsonNode body = objectMapper.readTree(response);
        return body.get("token").asText();
    }

    private String json(Object value) throws Exception {
        return objectMapper.writeValueAsString(value);
    }
}
