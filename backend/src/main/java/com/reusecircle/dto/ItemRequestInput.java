package com.reusecircle.dto;

import lombok.Data;
import jakarta.validation.constraints.*;

@Data
public class ItemRequestInput {
    @Size(max = 500)
    private String message;
}
