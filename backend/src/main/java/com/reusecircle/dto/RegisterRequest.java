package com.reusecircle.dto;

import lombok.Data;
import jakarta.validation.constraints.*;

@Data
public class RegisterRequest {
    @NotBlank @Size(max = 80)
    private String name;
    @NotBlank @Email @Size(max = 160)
    private String email;
    @NotBlank @Size(min = 8, max = 72)
    private String password;
}
