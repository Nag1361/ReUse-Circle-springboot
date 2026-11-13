package com.reusecircle.dto;

import lombok.Data;
import jakarta.validation.constraints.*;

@Data
public class LoginRequest {
    @NotBlank @Email @Size(max = 160)
    private String email;
    @NotBlank @Size(max = 72)
    private String password;
}
