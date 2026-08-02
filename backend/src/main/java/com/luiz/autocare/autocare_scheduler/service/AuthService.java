package com.luiz.autocare.autocare_scheduler.service;

import com.luiz.autocare.autocare_scheduler.dto.AuthResponse;
import com.luiz.autocare.autocare_scheduler.dto.LoginRequest;
import com.luiz.autocare.autocare_scheduler.dto.RegisterRequest;
import com.luiz.autocare.autocare_scheduler.exception.DuplicateEmailException;
import com.luiz.autocare.autocare_scheduler.model.Client;
import com.luiz.autocare.autocare_scheduler.model.Role;
import com.luiz.autocare.autocare_scheduler.model.User;
import com.luiz.autocare.autocare_scheduler.repository.ClientRepository;
import com.luiz.autocare.autocare_scheduler.repository.UserRepository;
import com.luiz.autocare.autocare_scheduler.security.JwtService;
import org.springframework.dao.DataIntegrityViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
public class AuthService {
    private static final String INVALID_CREDENTIALS = "Invalid email or password";
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, ClientRepository clientRepository,
                       PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.clientRepository = clientRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.getEmail());
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new DuplicateEmailException("Email is already registered");
        }

        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.CLIENT);

        try {
            user = userRepository.saveAndFlush(user);
        } catch (DataIntegrityViolationException ex) {
            throw new DuplicateEmailException("Email is already registered");
        }

        Client client = new Client();
        client.setName(request.getName());
        client.setPhone(request.getPhone());
        client.setEmail(email);
        client.setUser(user);
        client = clientRepository.save(client);

        return new AuthResponse(jwtService.generateToken(user, client.getId()));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = normalizeEmail(request.getEmail());
        logger.info("Login request reached authentication service for email {}", email);
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> {
                    logger.warn("Login rejected for email {}", email);
                    return new BadCredentialsException(INVALID_CREDENTIALS);
                });
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            logger.warn("Login rejected for email {}", email);
            throw new BadCredentialsException(INVALID_CREDENTIALS);
        }

        Long clientId = null;
        if (user.getRole() == Role.CLIENT) {
            clientId = clientRepository.findByUserId(user.getId())
                    .map(Client::getId)
                    .orElseThrow(() -> new BadCredentialsException(INVALID_CREDENTIALS));
        }
        logger.info("Login succeeded for user id {} with role {}", user.getId(), user.getRole());
        return new AuthResponse(jwtService.generateToken(user, clientId));
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
