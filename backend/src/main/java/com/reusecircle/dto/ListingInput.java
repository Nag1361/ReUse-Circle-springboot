package com.reusecircle.dto;

import lombok.Data;
import jakarta.validation.constraints.*;

@Data
public class ListingInput {
    @NotBlank @Size(max = 120)
    private String title;
    @NotBlank @Size(max = 60)
    private String category;
    @NotBlank @Size(max = 60)
    private String condition;
    @NotBlank @Size(max = 2000)
    private String description;
    @NotBlank @Size(max = 160)
    private String pickupArea;
    @Size(max = 1000)
    private String imageUrl;
}
