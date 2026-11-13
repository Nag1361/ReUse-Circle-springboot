package com.reusecircle.controller;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import com.reusecircle.dto.*;
import com.reusecircle.service.AuthService;

@RestController @RequestMapping("/api/auth") @RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register") @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest input) {
        return authService.register(input);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest input) {
        return authService.login(input);
    }
}
