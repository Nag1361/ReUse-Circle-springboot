package com.reusecircle.service;


import java.nio.charset.StandardCharsets;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.reusecircle.dto.*;
import com.reusecircle.entity.User;
import com.reusecircle.repository.UserRepository;
import com.reusecircle.security.JwtService;

@Service @RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest input) {
        String email = input.getEmail().trim().toLowerCase(Locale.ROOT);
        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
        }
        // BCrypt accepts at most 72 bytes (not necessarily 72 characters).
        if (input.getPassword().getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at most 72 UTF-8 bytes");
        }
        User user = new User();
        user.setName(input.getName().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(input.getPassword()));
        userRepository.saveAndFlush(user);
        return response(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest input) {
        if (input.getPassword().getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }
        User user = userRepository.findByEmail(input.getEmail().trim().toLowerCase(Locale.ROOT))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));
        if (!passwordEncoder.matches(input.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }
        return response(user);
    }

    private AuthResponse response(User user) {
        return new AuthResponse(jwtService.createToken(user),
            new UserResponse(user.getId(), user.getName(), user.getEmail()));
    }
}
